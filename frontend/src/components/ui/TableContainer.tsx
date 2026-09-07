import React from "react";
import { LoadingState, EmptyState } from "./States";

interface TableContainerProps {
  isLoading?: boolean;
  isEmpty?: boolean;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  variant?: "default" | "embedded";
  children: React.ReactNode;
}

export const TableContainer: React.FC<TableContainerProps> = ({
  isLoading = false,
  isEmpty = false,
  loadingMessage = "Carregando...",
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription = "Não há registros cadastrados ou que correspondam aos filtros.",
  variant = "default",
  children,
}) => {
  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
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
