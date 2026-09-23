import React, { useState } from "react";

interface CopyableIdProps {
  id?: string | null;
  label?: string;
  truncate?: boolean;
  className?: string;
}

export const CopyableId: React.FC<CopyableIdProps> = ({
  id,
  label,
  truncate = false,
  className = "",
}) => {
  const [copiado, setCopiado] = useState(false);

  if (!id) return <span className="text-(--muted) text-xs">—</span>;

  const handleCopiar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar:", err);
    }
  };

  const idExibido = truncate ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {label && (
        <span className="text-xs text-(--muted) font-medium">{label}:</span>
      )}
      <span
        title={id}
        className="font-mono text-xs px-2 py-0.5 rounded bg-(--surface-2) text-(--fg) border border-(--border) select-all break-all"
      >
        {idExibido}
      </span>
      <button
        type="button"
        onClick={handleCopiar}
        title={copiado ? "Copiado!" : "Copiar ID"}
        className={`p-1 rounded transition-colors text-xs flex items-center gap-1 ${
          copiado
            ? "text-emerald-500 bg-emerald-500/10 font-medium"
            : "text-(--muted) hover:text-(--fg) hover:bg-(--surface-2)"
        }`}
      >
        {copiado ? (
          <>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-[10px]">Copiado</span>
          </>
        ) : (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    </div>
  );
};
