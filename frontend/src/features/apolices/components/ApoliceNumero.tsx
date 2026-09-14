import React from "react";
import { useApolicePorId } from "../hooks/useApolices";

interface ApoliceNumeroProps {
  apoliceId: string;
}

export const ApoliceNumero: React.FC<ApoliceNumeroProps> = ({ apoliceId }) => {
  const { data: apolice, isLoading } = useApolicePorId(apoliceId);

  if (isLoading) {
    return (
      <span className="text-(--muted) text-xs animate-pulse">
        Carregando...
      </span>
    );
  }

  if (!apolice) {
    return (
      <span className="mono text-xs text-(--muted)">
        {apoliceId.slice(0, 8)}…
      </span>
    );
  }
  return <span>{apolice.numeroApolice}</span>;
};
