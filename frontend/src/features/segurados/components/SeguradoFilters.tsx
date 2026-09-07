import React, { useState } from "react";
import { Button, SearchInput } from "../../../components/ui";

interface SeguradoFiltersProps {
  onSearch: (nome: string) => void;
  isLoading?: boolean;
}

export const SeguradoFilters: React.FC<SeguradoFiltersProps> = ({
  onSearch,
  isLoading = false,
}) => {
  const [termo, setTermo] = useState("");

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(termo.trim());
  };

  const handleClear = () => {
    setTermo("");
    onSearch("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-center gap-3 bg-(--surface) p-4 rounded-(--radius) border border-(--border) shadow-xs"
    >
      <SearchInput
        value={termo}
        onValueChange={setTermo}
        placeholder="Buscar por nome ou razão social..."
      />

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {termo && (
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
