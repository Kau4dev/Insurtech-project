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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs sm:text-sm text-(--muted)">
      <div>
        Mostrando <span className="font-medium text-(--fg) num">{startElement}</span> a{" "}
        <span className="font-medium text-(--fg) num">{endElement}</span> de{" "}
        <span className="font-medium text-(--fg) num">{totalElements}</span> resultados
      </div>

      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 sm:flex-initial"
          disabled={disabled || currentPage === 0}
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        >
          Anterior
        </Button>

        <span className="px-2 text-xs font-medium text-(--fg) whitespace-nowrap">
          Página <span className="num font-semibold">{currentPage + 1}</span> de <span className="num font-semibold">{Math.max(1, totalPages)}</span>
        </span>

        <Button
          variant="secondary"
          size="sm"
          className="flex-1 sm:flex-initial"
          disabled={disabled || currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
};
