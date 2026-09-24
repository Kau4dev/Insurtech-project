import React from "react";
import { EmptyState, ErrorState, LoadingState } from "./States";

interface TableContainerProps {
  isLoading?: boolean;
  isEmpty?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  errorMessage?: string;
  variant?: "default" | "embedded";
  children: React.ReactNode;
}

export const TableContainer: React.FC<TableContainerProps> = ({
  isLoading = false,
  isEmpty = false,
  isError = false,
  onRetry,
  loadingMessage = "Carregando...",
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription = "Não há registros cadastrados ou que correspondam aos filtros.",
  errorMessage = "Não foi possível carregar os registros. Verifique a conexão com o servidor.",
  variant = "default",
  children,
}) => {
  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (isError) {
    return <ErrorState message={errorMessage} onRetry={onRetry} />;
  }

  if (isEmpty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const containerClasses =
    variant === "embedded"
      ? "w-full overflow-hidden border border-(--border) rounded-lg"
      : "w-full overflow-hidden bg-(--surface) border border-(--border) rounded-(--radius) shadow-xs";

  return (
    <div className={containerClasses}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          {children}
        </table>
      </div>
    </div>
  );
};

