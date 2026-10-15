import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMeuPerfilSegurado } from "../hooks/useMeuPerfilSegurado";
import { useMinhasApolices } from "../hooks/useMinhasApolices";
import { MinhasApolicesCard } from "../components/MinhasApolicesCard";
import { Button, Pagination, SearchInput, Select } from "../../../components/ui";

const STATUS_OPTIONS = [
  { value: "ATIVA", label: "Ativa" },
  { value: "EXPIRADA", label: "Expirada" },
  { value: "CANCELADA", label: "Cancelada" },
  { value: "SUSPENSA", label: "Suspensa" },
];

export const PortalApolicesPage: React.FC = () => {
  const { data: segurado, isLoading: loadingSegurado } = useMeuPerfilSegurado();
  const seguradoId = segurado?.id || "";

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 6;

  const { data: apolicesPage, isLoading: loadingApolices } =
    useMinhasApolices(seguradoId, { size: 100 });

  const apolices = apolicesPage?.content || [];

  const apolicesFiltradas = apolices.filter((apolice) => {
    const matchBusca =
      !busca.trim() ||
      apolice.numeroApolice.toLowerCase().includes(busca.toLowerCase()) ||
      apolice.tipoSeguro.toLowerCase().includes(busca.toLowerCase());

    const matchStatus = !statusFiltro || apolice.status === statusFiltro;

    return matchBusca && matchStatus;
  });

  const totalElements = apolicesFiltradas.length;
  const totalPages = Math.ceil(totalElements / pageSize);
  const currentPage = Math.min(page, Math.max(0, totalPages - 1));

  const apolicesPaginadas = apolicesFiltradas.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handleBuscaChange = (val: string) => {
    setBusca(val);
    setPage(0);
  };

  const handleStatusChange = (val: string) => {
    setStatusFiltro(val);
    setPage(0);
  };

  const handleLimparFiltros = () => {
    setBusca("");
    setStatusFiltro("");
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header com navegação e breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-(--muted) mb-1">
            <Link
              to="/portal"
              className="hover:text-(--fg) hover:underline transition-colors flex items-center gap-1"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Portal</span>
            </Link>
            <span>/</span>
            <span className="text-(--fg) font-medium">Apólices</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-(--fg)">
            Minhas Apólices
          </h1>
          <p className="text-xs text-(--muted) mt-0.5">
            Consulte a cobertura e a vigência de todos os seguros contratados em
            seu nome.
          </p>
        </div>

        <Link to="/portal" className="self-start sm:self-auto">
          <Button variant="secondary" size="sm" className="text-xs gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Voltar ao Início</span>
          </Button>
        </Link>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="p-3.5 sm:p-4 rounded-(--radius) bg-(--surface) border border-(--border) shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Buscar por número ou tipo de seguro..."
            value={busca}
            onValueChange={handleBuscaChange}
          />
        </div>
        <div className="w-full sm:w-52">
          <Select
            placeholder="Todos os Status"
            options={STATUS_OPTIONS}
            value={statusFiltro}
            onChange={(e) => handleStatusChange(e.target.value)}
          />
        </div>
        {(busca || statusFiltro) && (
          <button
            type="button"
            onClick={handleLimparFiltros}
            className="text-xs text-(--muted) hover:text-(--accent-ink) underline underline-offset-2 transition-colors cursor-pointer self-center sm:self-auto"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Grid de Conteúdo */}
      {loadingSegurado || loadingApolices ? (
        <div className="py-16 text-center space-y-2">
          <div className="animate-spin w-8 h-8 border-2 border-(--accent) border-t-transparent rounded-full mx-auto" />
          <p className="text-xs text-(--muted)">Carregando apólices...</p>
        </div>
      ) : apolicesFiltradas.length === 0 ? (
        <div className="p-12 rounded-(--radius) bg-(--surface) border border-(--border) text-center space-y-2.5">
          <div className="w-10 h-10 rounded-full bg-(--surface-2) text-(--muted) flex items-center justify-center mx-auto">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3 className="font-semibold text-sm text-(--fg)">
            Nenhuma apólice encontrada
          </h3>
          <p className="text-xs text-(--muted) max-w-sm mx-auto">
            {busca || statusFiltro
              ? "Tente ajustar os filtros de busca para encontrar o registro desejado."
              : "Você ainda não possui apólices cadastradas no sistema."}
          </p>
          {(busca || statusFiltro) && (
            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLimparFiltros}
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {apolicesPaginadas.map((apolice) => (
              <MinhasApolicesCard key={apolice.id} apolice={apolice} />
            ))}
          </div>

          <div className="pt-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </div>
  );
};
