import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMeuPerfilSegurado } from "../hooks/useMeuPerfilSegurado";
import { useMinhasApolices } from "../hooks/useMinhasApolices";
import { MinhasApolicesCard } from "../components/MinhasApolicesCard";
import { Button, SearchInput, Select } from "../../../components/ui";

const STATUS_OPTIONS = [
  { value: "", label: "Todos os Status" },
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

  const { data: apolicesPage, isLoading: loadingApolices } =
    useMinhasApolices(seguradoId);

  const apolices = apolicesPage?.content || [];

  const apolicesFiltradas = apolices.filter((apolice) => {
    const matchBusca =
      !busca.trim() ||
      apolice.numeroApolice.toLowerCase().includes(busca.toLowerCase()) ||
      apolice.tipoSeguro.toLowerCase().includes(busca.toLowerCase());

    const matchStatus = !statusFiltro || apolice.status === statusFiltro;

    return matchBusca && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header com navegação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-(--muted) mb-1">
            <Link to="/portal" className="hover:underline">
              Portal
            </Link>
            <span>/</span>
            <span className="text-(--fg)">Apólices</span>
          </div>
          <h1 className="text-2xl font-bold text-(--fg)">Minhas Apólices</h1>
          <p className="text-xs text-(--muted) mt-0.5">
            Consulte a cobertura e a vigência de todos os seguros contratados em seu nome.
          </p>
        </div>

        <Link to="/portal">
          <Button variant="secondary" size="sm">
            ← Voltar ao Início
          </Button>
        </Link>
      </div>

      {/* Barra de Filtros */}
      <div className="p-4 rounded-xl bg-(--surface) border border-(--border) flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Buscar por número ou tipo de seguro..."
            value={busca}
            onValueChange={setBusca}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={STATUS_OPTIONS}
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
          />
        </div>
      </div>

      {/* Conteúdo */}
      {loadingSegurado || loadingApolices ? (
        <div className="py-12 text-center text-sm text-(--muted)">
          Carregando apólices...
        </div>
      ) : apolicesFiltradas.length === 0 ? (
        <div className="p-12 rounded-xl bg-(--surface) border border-(--border) text-center space-y-2">
          <span className="text-3xl">🔍</span>
          <h3 className="font-semibold text-base text-(--fg)">
            Nenhuma apólice encontrada
          </h3>
          <p className="text-xs text-(--muted)">
            {busca || statusFiltro
              ? "Tente ajustar os filtros de busca para encontrar o registro desejado."
              : "Você ainda não possui apólices cadastradas."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {apolicesFiltradas.map((apolice) => (
            <MinhasApolicesCard key={apolice.id} apolice={apolice} />
          ))}
        </div>
      )}
    </div>
  );
};
