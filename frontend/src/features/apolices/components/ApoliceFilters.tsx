import React, { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import type { StatusApolice, TipoSeguro } from "../../../interfaces/enums";

export interface ApoliceFiltrosState {
  termo: string;
  status: StatusApolice | "";
  tipoSeguro: TipoSeguro | "";
}

interface ApoliceFiltersProps {
  onSearch: (filtros: ApoliceFiltrosState) => void;
  isLoading?: boolean;
}

export const ApoliceFilters: React.FC<ApoliceFiltersProps> = ({
  onSearch,
  isLoading = false,
}) => {
  const [termo, setTermo] = useState("");
  const [status, setStatus] = useState<StatusApolice | "">("");
  const [tipoSeguro, setTipoSeguro] = useState<TipoSeguro | "">("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ termo: termo.trim(), status, tipoSeguro });
  };

  const handleClear = () => {
    setTermo("");
    setStatus("");
    setTipoSeguro("");
    onSearch({ termo: "", status: "", tipoSeguro: "" });
  };

  const statusOptions = [
    { value: "ATIVA", label: "Ativa" },
    { value: "SUSPENSA", label: "Suspensa" },
    { value: "CANCELADA", label: "Cancelada" },
    { value: "EXPIRADA", label: "Expirada" },
  ];

  const ramoOptions = [
    { value: "AUTO", label: "Automóvel" },
    { value: "RESIDENCIAL", label: "Residencial" },
    { value: "PATRIMONIAL", label: "Patrimonial" },
    { value: "EMPRESARIAL", label: "Empresarial" },
    { value: "VIDA", label: "Vida" },
  ];

  const hasFilters = Boolean(termo || status || tipoSeguro);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-center gap-3 bg-(--surface) p-4 rounded-(--radius) border border-(--border) shadow-xs"
    >
      <div className="w-full sm:w-48">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusApolice | "")}
          options={statusOptions}
          placeholder="Todos os status"
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          value={tipoSeguro}
          onChange={(e) => setTipoSeguro(e.target.value as TipoSeguro | "")}
          options={ramoOptions}
          placeholder="Todos os ramos"
        />
      </div>

      <div className="relative flex-1 w-full">
        <input
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar número da apólice ou segurado..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-(--surface) border border-(--border) rounded-lg outline-none focus:border-(--accent) text-(--fg) placeholder:text-(--faint) transition-colors"
        />
        <svg
          className="absolute left-3 top-2.5 h-4 w-4 text-(--muted)"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {hasFilters && (
          <Button variant="ghost" size="md" type="button" onClick={handleClear}>
            Limpar
          </Button>
        )}
        <Button variant="primary" size="md" type="submit" isLoading={isLoading}>
          Buscar
        </Button>
      </div>
    </form>
  );
};
