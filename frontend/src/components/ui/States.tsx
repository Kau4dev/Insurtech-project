import React from "react";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Nenhum registro encontrado",
  description = "Não há dados para exibir no momento.",
  icon,
  action,
}) => {
  return (
    <div className="w-full bg-(--surface) border border-(--border) rounded-(--radius) p-12 text-center text-(--muted) shadow-xs">
      {icon || (
        <svg
          className="mx-auto h-10 w-10 text-(--faint) mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      )}
      <p className="text-base font-medium text-(--fg)">{title}</p>
      {description && <p className="text-sm text-(--muted) mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Carregando dados...",
}) => {
  return (
    <div className="w-full bg-(--surface) border border-(--border) rounded-(--radius) p-8 text-center text-(--muted) shadow-xs">
      <div className="flex items-center justify-center gap-2">
        <svg
          className="animate-spin h-5 w-5 text-(--accent)"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Erro ao carregar dados",
  message = "Ocorreu um problema ao conectar com o serviço backend.",
  onRetry,
}) => {
  return (
    <div className="w-full bg-(--surface) border border-rose-200 dark:border-rose-900/50 rounded-(--radius) p-8 text-center text-(--muted) shadow-xs">
      <div className="w-10 h-10 text-rose-500 mx-auto flex items-center justify-center mb-3">
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-base font-semibold text-(--fg)">{title}</p>
      <p className="text-sm text-(--muted) mt-1 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center font-medium rounded-lg transition-colors cursor-pointer px-3.5 py-1.5 text-xs bg-(--surface-2) hover:bg-(--surface) text-(--fg) border border-(--border)"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
};


