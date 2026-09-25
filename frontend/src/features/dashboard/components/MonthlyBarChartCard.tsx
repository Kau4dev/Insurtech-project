import React, { useMemo, useState } from "react";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";

export interface MonthlyBarChartCardProps {
  sinistros?: Sinistro[];
}

interface MonthItem {
  month: string;
  fullName: string;
  value: number;
  year: number;
  monthIndex: number;
  isCurrentMonth: boolean;
}

const NOMES_MESES_ABREV = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const NOMES_MESES_COMPLETO = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function parseData(dateStr?: string): Date | null {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const d = new Date(`${dateStr}T12:00:00`);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export const MonthlyBarChartCard: React.FC<MonthlyBarChartCardProps> = ({
  sinistros = [],
}) => {
  const currentDate = useMemo(() => new Date(), []);
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();
  const currentSemester = currentMonthIndex >= 6 ? 1 : 0;

  // Estado da navegação do carrossel (ano e semestre: 0 = Jan-Jun, 1 = Jul-Dez)
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedSemester, setSelectedSemester] = useState<number>(currentSemester);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Descobre todos os anos que possuem sinistros cadastrados
  const availableYears = useMemo<number[]>(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(currentYear);
    // Adiciona pelo menos 3 anos para trás para possibilitar navegação histórica
    yearsSet.add(currentYear - 1);
    yearsSet.add(currentYear - 2);
    yearsSet.add(currentYear - 3);

    (sinistros || []).forEach((s) => {
      const d = parseData(s.createdAt || s.dataOcorrencia);
      if (d) {
        yearsSet.add(d.getFullYear());
      }
    });

    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [sinistros, currentYear]);

  const minYear = availableYears[0];
  const maxYear = availableYears[availableYears.length - 1];

  // Navega para o semestre/período anterior
  const handlePreviousPeriod = () => {
    if (selectedSemester === 1) {
      setSelectedSemester(0);
    } else if (selectedYear > minYear) {
      setSelectedYear((prev) => prev - 1);
      setSelectedSemester(1);
    }
  };

  // Navega para o próximo semestre/período
  const handleNextPeriod = () => {
    if (selectedSemester === 0) {
      setSelectedSemester(1);
    } else if (selectedYear < maxYear) {
      setSelectedYear((prev) => prev + 1);
      setSelectedSemester(0);
    }
  };

  // Volta para o período atual (hoje)
  const handleResetToCurrent = () => {
    setSelectedYear(currentYear);
    setSelectedSemester(currentSemester);
  };

  const isCurrentPeriod =
    selectedYear === currentYear && selectedSemester === currentSemester;
  const canGoPrevious =
    selectedYear > minYear || (selectedYear === minYear && selectedSemester > 0);
  const canGoNext =
    selectedYear < maxYear || (selectedYear === maxYear && selectedSemester < 1);

  // Gera os 6 meses do semestre selecionado e computa os valores
  const monthsData = useMemo<MonthItem[]>(() => {
    const startMonth = selectedSemester === 0 ? 0 : 6;
    const items: MonthItem[] = [];

    for (let i = 0; i < 6; i++) {
      const monthIdx = startMonth + i;
      const isCurrentMonth =
        selectedYear === currentYear && monthIdx === currentMonthIndex;

      // Filtra e contabiliza estritamente os sinistros reais registrados
      const realCount = (sinistros || []).filter((s) => {
        const d = parseData(s.createdAt || s.dataOcorrencia);
        if (!d) return false;
        return (
          d.getMonth() === monthIdx && d.getFullYear() === selectedYear
        );
      }).length;

      items.push({
        month: NOMES_MESES_ABREV[monthIdx],
        fullName: NOMES_MESES_COMPLETO[monthIdx],
        value: realCount,
        year: selectedYear,
        monthIndex: monthIdx,
        isCurrentMonth,
      });
    }

    return items;
  }, [sinistros, selectedYear, selectedSemester, currentYear, currentMonthIndex]);

  const totalPeriodo = useMemo(() => {
    return monthsData.reduce((acc, curr) => acc + curr.value, 0);
  }, [monthsData]);

  const maxSinistros = Math.max(...monthsData.map((d) => d.value), 0);
  const maxValue = maxSinistros > 0 ? maxSinistros : 1;

  const periodLabel =
    selectedSemester === 0
      ? `Jan – Jun ${selectedYear}`
      : `Jul – Dez ${selectedYear}`;

  return (
    <div
      data-testid="monthly-barchart-card"
      className="bg-(--surface) border border-(--border) rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full"
    >
      {/* Cabeçalho com Título, Informações do Período e Controles do Carrossel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[15px] font-semibold text-(--fg) tracking-tight">
              Sinistros por mês
            </h2>
            <span
              data-testid="carousel-period-badge"
              className="text-[12px] font-medium px-2 py-0.5 rounded-md bg-(--surface-2) text-(--muted) border border-(--border)"
            >
              {periodLabel}
            </span>
            {totalPeriodo > 0 ? (
              <span className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
                {totalPeriodo} {totalPeriodo === 1 ? "registro" : "registros"}
              </span>
            ) : (
              <span className="text-[12px] text-(--muted)">sem registros</span>
            )}
          </div>
        </div>

        {/* Controles Dinâmicos do Carrossel (Meses e Anos) */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* Botão de Retorno Rápido ao Mês Atual */}
          {!isCurrentPeriod && (
            <button
              type="button"
              onClick={handleResetToCurrent}
              title="Voltar ao período atual"
              data-testid="carousel-btn-current"
              className="text-[11px] font-medium px-2 py-1 rounded-md text-(--accent-ink) hover:bg-(--surface-2) transition-colors cursor-pointer mr-1"
            >
              Mês atual
            </button>
          )}

          {/* Seletor de Ano */}
          <div className="flex items-center bg-(--surface-2) border border-(--border) rounded-lg p-0.5">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              data-testid="carousel-year-select"
              aria-label="Selecionar ano"
              className="bg-transparent text-[12px] font-medium text-(--fg) px-1.5 py-0.5 rounded focus:outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr} className="bg-(--surface) text-(--fg)">
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Pílulas de Semestre */}
          <div className="flex items-center bg-(--surface-2) border border-(--border) rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setSelectedSemester(0)}
              data-testid="carousel-sem1-btn"
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                selectedSemester === 0
                  ? "bg-(--surface) text-(--fg) shadow-xs font-semibold"
                  : "text-(--muted) hover:text-(--fg)"
              }`}
            >
              1º Sem
            </button>
            <button
              type="button"
              onClick={() => setSelectedSemester(1)}
              data-testid="carousel-sem2-btn"
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                selectedSemester === 1
                  ? "bg-(--surface) text-(--fg) shadow-xs font-semibold"
                  : "text-(--muted) hover:text-(--fg)"
              }`}
            >
              2º Sem
            </button>
          </div>

          {/* Setas de Navegação do Carrossel */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePreviousPeriod}
              disabled={!canGoPrevious}
              data-testid="carousel-btn-prev"
              title="Período anterior"
              aria-label="Período anterior"
              className={`w-7 h-7 flex items-center justify-center rounded-lg border border-(--border) transition-all ${
                canGoPrevious
                  ? "bg-(--surface) hover:bg-(--surface-2) text-(--fg) cursor-pointer"
                  : "bg-(--surface)/50 text-(--muted)/40 cursor-not-allowed opacity-50"
              }`}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleNextPeriod}
              disabled={!canGoNext}
              data-testid="carousel-btn-next"
              title="Próximo período"
              aria-label="Próximo período"
              className={`w-7 h-7 flex items-center justify-center rounded-lg border border-(--border) transition-all ${
                canGoNext
                  ? "bg-(--surface) hover:bg-(--surface-2) text-(--fg) cursor-pointer"
                  : "bg-(--surface)/50 text-(--muted)/40 cursor-not-allowed opacity-50"
              }`}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Área das Barras com Trilho e Hover Dinâmico */}
      <div className="h-44 flex items-end justify-between gap-3 px-2 pt-2 pb-1">
        {monthsData.map((item, index) => {
          const isHovered = hoveredIndex === index;
          // Altura proporcional baseada estritamente nos dados reais
          const heightPercent =
            item.value > 0
              ? Math.max(16, Math.round((item.value / maxValue) * 100))
              : 4; // Altura sutil de 4% para a linha de base quando for 0

          return (
            <div
              key={`${item.year}-${item.monthIndex}`}
              className="flex-1 flex flex-col items-center gap-2 group h-full justify-end cursor-pointer select-none"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              data-testid={`bar-month-${item.monthIndex}`}
            >
              {/* Trilho de fundo com barra preenchida interna */}
              <div className="w-full max-w-11 h-32.5 rounded-xl flex items-end justify-center p-1 transition-colors">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`relative w-full rounded-lg transition-all duration-200 ${
                    item.value === 0
                      ? "bg-(--border-strong)/40"
                      : isHovered
                        ? "bg-emerald-600 shadow-sm"
                        : "bg-[#6b7c96] dark:bg-slate-500"
                  }`}
                >
                  {/* Valor numérico real acompanhando a altura da barra */}
                  <span
                    className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[12px] font-medium whitespace-nowrap transition-all duration-150 ${
                      item.value > 0
                        ? isHovered
                          ? "text-emerald-600 font-semibold -translate-y-0.5"
                          : "text-slate-600 dark:text-slate-300 font-medium"
                        : "text-(--muted)"
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              </div>

              {/* Rótulo do Mês com indicação se for o mês corrente */}
              <div className="flex flex-col items-center">
                <span
                  className={`text-[12px] transition-colors duration-150 ${
                    isHovered
                      ? "text-emerald-600 font-semibold"
                      : item.isCurrentMonth
                        ? "text-(--fg) font-semibold"
                        : "text-slate-500 dark:text-slate-400 font-medium"
                  }`}
                >
                  {item.month}
                </span>
                {item.isCurrentMonth && (
                  <span
                    title="Mês atual"
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
