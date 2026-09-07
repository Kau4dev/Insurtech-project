import React, { useState } from "react";
import { Button, Select, SearchInput } from "../../../components/ui";
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

export const ApoliceFilters: React.FC<ApoliceFiltersProps> = ({
  onSearch,
  isLoading = false,
}) => {
  const [termo, setTermo] = useState("");
  const [status, setStatus] = useState<StatusApolice | "">("");
  const [tipoSeguro, setTipoSeguro] = useState<TipoSeguro | "">("");

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch({ termo: termo.trim(), status, tipoSeguro });
  };

  const handleClear = () => {
    setTermo("");
    setStatus("");
    setTipoSeguro("");
    onSearch({ termo: "", status: "", tipoSeguro: "" });
  };

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

      <SearchInput
        value={termo}
        onValueChange={setTermo}
        placeholder="Buscar número da apólice ou segurado..."
      />

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
