import React from "react";
import { Button } from "./Button";

interface TableActionsProps {
  onVisualizar?: () => void;
  onEditar?: () => void;
  visualizarTitle?: string;
  editarTitle?: string;
  children?: React.ReactNode;
}

export const TableActions: React.FC<TableActionsProps> = ({
  onVisualizar,
  onEditar,
  visualizarTitle = "Visualizar detalhes",
  editarTitle = "Editar registro",
  children,
}) => {
  return (
    <div className="inline-flex items-center gap-1.5 justify-end">
      {onVisualizar && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onVisualizar}
          title={visualizarTitle}
        >
          Ver
        </Button>
      )}
      {onEditar && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onEditar}
          title={editarTitle}
        >
          Editar
        </Button>
      )}
      {children}
    </div>
  );
};

