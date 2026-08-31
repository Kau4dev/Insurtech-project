import React from "react";
import { Button } from "./Button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  disabled = false,
}) => {
  if (totalElements === 0) return null;

  const startElement = currentPage * pageSize + 1;
  const endElement = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-sm text-(--muted)">
      <div>
        Mostrando <span className="font-medium text-(--fg)">{startElement}</span> a{" "}
        <span className="font-medium text-(--fg)">{endElement}</span> de{" "}
        <span className="font-medium text-(--fg)">{totalElements}</span> resultados
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled || currentPage === 0}
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        >
          Anterior
        </Button>

        <span className="px-2 text-xs font-medium text-(--fg)">
          Página {currentPage + 1} de {Math.max(1, totalPages)}
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={disabled || currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
};
