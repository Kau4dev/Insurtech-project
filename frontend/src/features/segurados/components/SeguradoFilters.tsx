import React, { useState } from "react";
import { Button } from "../../../components/ui/Button";

interface SeguradoFiltersProps {
  onSearch: (nome: string) => void;
  isLoading?: boolean;
}

export const SeguradoFilters: React.FC<SeguradoFiltersProps> = ({
  onSearch,
  isLoading = false,
}) => {
  const [termo, setTermo] = useState("");

  const handleSubmit = (e: React.SubmitEvent) => {
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
      <div className="relative flex-1 w-full">
        <input
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por nome ou razão social..."
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
