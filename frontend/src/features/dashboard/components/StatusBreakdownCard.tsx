import React from "react";
import { Link } from "react-router-dom";
import type { StatusSinistro } from "../../../interfaces/enums";

export interface StatusBreakdownProps {
  contagemPorStatus?: Partial<Record<StatusSinistro, number>>;
  isLoading?: boolean;
}

interface StatusItemConfig {
  status: StatusSinistro;
  label: string;
  colorClass: string;
  dotColorClass: string;
}

const STATUS_CONFIGS: StatusItemConfig[] = [
  {
    status: "REGISTRADO",
    label: "Registrado",
    colorClass: "bg-slate-400",
    dotColorClass: "bg-slate-400",
  },
  {
    status: "EM_ANALISE",
    label: "Em análise",
    colorClass: "bg-amber-500",
    dotColorClass: "bg-amber-500",
  },
  {
    status: "AGUARDANDO_DOCUMENTOS",
    label: "Aguardando docs",
    colorClass: "bg-orange-500",
    dotColorClass: "bg-orange-500",
  },
  {
    status: "APROVADO",
    label: "Aprovado",
    colorClass: "bg-emerald-500",
    dotColorClass: "bg-emerald-500",
  },
  {
    status: "PAGO",
    label: "Pago",
    colorClass: "bg-sky-500",
    dotColorClass: "bg-sky-500",
  },
  {
    status: "REJEITADO",
    label: "Rejeitado",
    colorClass: "bg-rose-500",
    dotColorClass: "bg-rose-500",
  },
];

export const StatusBreakdownCard: React.FC<StatusBreakdownProps> = ({
  contagemPorStatus,
  isLoading = false,
}) => {
  const hasRealData =
    contagemPorStatus &&
    Object.values(contagemPorStatus).some(
      (v) => typeof v === "number" && v > 0,
    );

  const counts: Record<StatusSinistro, number> = {
    REGISTRADO: hasRealData ? (contagemPorStatus?.REGISTRADO ?? 0) : 1,
    EM_ANALISE: hasRealData ? (contagemPorStatus?.EM_ANALISE ?? 0) : 2,
    AGUARDANDO_DOCUMENTOS: hasRealData
      ? (contagemPorStatus?.AGUARDANDO_DOCUMENTOS ?? 0)
      : 1,
    APROVADO: hasRealData ? (contagemPorStatus?.APROVADO ?? 0) : 1,
    PAGO: hasRealData ? (contagemPorStatus?.PAGO ?? 0) : 2,
    REJEITADO: hasRealData ? (contagemPorStatus?.REJEITADO ?? 0) : 1,
  };

  const total = Object.values(counts).reduce((acc, curr) => acc + curr, 0) || 1;

  return (
    <div className="bg-(--surface) border border-(--border) rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold text-(--fg) tracking-tight">
          Saldos por status
        </h2>
        <Link
          to="/sinistros"
          className="text-[12px] font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          abrir lista
        </Link>
      </div>

      {/* Barra de Distribuição Horizontal Contínua */}
      <div className="w-full h-2 rounded-full overflow-hidden flex bg-(--surface-2) mb-5">
        {STATUS_CONFIGS.map((item) => {
          const count = counts[item.status] || 0;
          const pct = Math.round((count / total) * 100);
          if (pct <= 0) return null;

          return (
            <div
              key={item.status}
              style={{ width: `${pct}%` }}
              title={`${item.label}: ${count} (${pct}%)`}
              className={`${item.colorClass} transition-all duration-300`}
            />
          );
        })}
      </div>

      {/* Lista de Status */}
      <div className="flex flex-col divide-y divide-(--border)/60">
        {STATUS_CONFIGS.map((item) => {
          const count = counts[item.status] || 0;
          const percentage = Math.round((count / total) * 100);

          return (
            <div
              key={item.status}
              className="flex items-center justify-between py-2 text-[12.5px]"
            >
              {/* Nome do status com ponto indicador */}
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2 h-2 rounded-full ${item.dotColorClass}`}
                />
                <span className="text-(--fg) font-normal">{item.label}</span>
              </div>

              {/* Contagem e Porcentagem */}
              <div className="flex items-center gap-1.5 font-mono text-[12px] text-(--muted)">
                {isLoading ? (
                  <span className="inline-block w-8 h-3.5 bg-(--surface-2) animate-pulse rounded" />
                ) : (
                  <>
                    <span className="text-(--fg) font-medium">{count}</span>
                    <span>·</span>
                    <span>{percentage}%</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
