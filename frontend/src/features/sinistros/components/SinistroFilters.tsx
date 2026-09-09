import React, { useState } from "react";
import { Button, Select, SearchInput } from "../../../components/ui";
import type { StatusSinistro, TipoSinistro } from "../../../interfaces/enums";

export interface SinistroFiltrosState {
  termo: string;
  status: StatusSinistro | "";
  tipoSinistro: TipoSinistro | "";
}

interface SinistroFiltersProps {
  onSearch: (filtros: SinistroFiltrosState) => void;
  isLoading?: boolean;
}

const statusOptions = [
  { value: "REGISTRADO", label: "Registrado" },
  { value: "EM_ANALISE", label: "Em Análise" },
  { value: "AGUARDANDO_DOCUMENTOS", label: "Aguardando Documentos" },
  { value: "APROVADO", label: "Aprovado" },
  { value: "REJEITADO", label: "Rejeitado" },
  { value: "PAGO", label: "Pago" },
];

const ramoOptions = [
  { value: "COLISAO", label: "Colisão" },
  { value: "ROUBO_FURTO", label: "Roubo/Furto" },
  { value: "INCENDIO", label: "Incêndio" },
  { value: "DANO_A_TERCEIRO", label: "Dano a Terceiros" },
  { value: "ALAGAMENTO", label: "Alagamento" },
  { value: "QUEBRA_DE_VIDRO", label: "Quebra de Vidro" },
  { value: "OUTROS", label: "Outros" },
];

export const SinistroFilters: React.FC<SinistroFiltersProps> = ({
  onSearch,
  isLoading = false,
}) => {
  const [termo, setTermo] = useState("");
  const [status, setStatus] = useState<StatusSinistro | "">("");
  const [tipoSinistro, setTipoSinistro] = useState<TipoSinistro | "">("");

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch({ termo: termo.trim(), status, tipoSinistro });
  };

  const handleClear = () => {
    setTermo("");
    setStatus("");
    setTipoSinistro("");
    onSearch({ termo: "", status: "", tipoSinistro: "" });
  };

  const hasFilters = Boolean(termo || status || tipoSinistro);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-center gap-3 bg-(--surface) p-4 rounded-(--radius) border border-(--border) shadow-xs"
    >
      <div className="w-full sm:w-48">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusSinistro | "")}
          options={statusOptions}
          placeholder="Todos os status"
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          value={tipoSinistro}
          onChange={(e) => setTipoSinistro(e.target.value as TipoSinistro | "")}
          options={ramoOptions}
          placeholder="Todos os tipos de sinistro"
        />
      </div>

      <SearchInput
        value={termo}
        onValueChange={setTermo}
        placeholder="Buscar número do sinistro ou ID do segurado..."
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


