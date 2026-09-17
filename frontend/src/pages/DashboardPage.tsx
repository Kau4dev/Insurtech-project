import React from "react";
import { Button } from "../components/ui";

export const DashboardPage: React.FC = () => {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-(--accent-ink) font-semibold">
            Visão operacional
          </div>
          <h1 className="text-2xl font-bold text-(--fg)">
            Dashboard de Sinistros
          </h1>
          <p className="text-sm text-(--muted) mt-0.5">
            Posição do mês corrente e fila de trabalho da equipe.
          </p>
        </div>
        <Button variant="primary">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Registrar sinistro
        </Button>
      </div>
    </div>
  );
};
