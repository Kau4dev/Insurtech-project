import React from "react";
import { useUsuarioPorId } from "../../auth/hooks/useUsuarios";

interface AnalistaNomeProps {
  analistaId?: string | null;
  fallbackText?: string;
  showIcon?: boolean;
}

export const AnalistaNome: React.FC<AnalistaNomeProps> = ({
  analistaId,
  fallbackText = "—",
  showIcon = false,
}) => {
  const { data: usuario, isLoading } = useUsuarioPorId(analistaId);

  if (!analistaId) {
    return <span className="text-(--muted)">{fallbackText}</span>;
  }

  if (isLoading) {
    return (
      <span className="text-(--muted) text-xs animate-pulse">
        Carregando...
      </span>
    );
  }

  if (!usuario) {
    return (
      <span className="mono text-xs text-(--muted)">
        {analistaId.slice(0, 8)}…
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 font-medium text-(--fg)">
      {showIcon && (
        <svg
          className="w-3.5 h-3.5 text-(--accent-ink)"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      )}
      <span>{usuario.nome}</span>
    </span>
  );
};

