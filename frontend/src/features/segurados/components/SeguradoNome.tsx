import React from "react";
import { useSeguradoPorId } from "../hooks/useSegurados";

interface SeguradoNomeProps {
  seguradoId: string;
}

export const SeguradoNome: React.FC<SeguradoNomeProps> = ({ seguradoId }) => {
  const { data: segurado, isLoading } = useSeguradoPorId(seguradoId);

  if (isLoading) {
    return (
      <span className="text-(--muted) text-xs animate-pulse">
        Carregando...
      </span>
    );
  }

  if (!segurado) {
    return (
      <span className="mono text-xs text-(--muted)">
        {seguradoId.slice(0, 8)}…
      </span>
    );
  }
  return <span>{segurado.nomeRazaoSocial}</span>;
};
