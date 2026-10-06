import React, { useState } from "react";
import { Button, SearchInput } from "../../../components/ui";

interface SeguradoFiltersProps {
  onSearch: (termo: string) => void;
  isLoading?: boolean;
  initialTermo?: string;
}

export const SeguradoFilters: React.FC<SeguradoFiltersProps> = ({
  onSearch,
  isLoading = false,
  initialTermo = "",
}) => {
  const [termo, setTermo] = useState(initialTermo);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(termo.trim());
  };

  const handleClear = () => {
    setTermo("");
    onSearch("");
  };

  const handleValueChange = (val: string) => {
    setTermo(val);
    if (!val.trim() && initialTermo) {
      onSearch("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-center gap-2 rounded-(--radius)"
    >
      <SearchInput
        value={termo}
        onValueChange={handleValueChange}
        placeholder="Buscar por nome, razão social, CPF ou CNPJ..."
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
