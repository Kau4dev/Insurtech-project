import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { PapelUsuario } from "../interfaces/enums";

interface RotaProtegidaProps {
  children: React.ReactNode;
  papeisPermitidos?: PapelUsuario[];
}

export const RotaProtegida: React.FC<RotaProtegidaProps> = ({
  children,
  papeisPermitidos,
}) => {
  const { isAuthenticated, isLoading, usuario } = useAuth();
  const location = useLocation();

  // Enquanto revalida o token JWT no backend, exibe feedback de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-(--bg) text-(--fg)">
        <div className="w-9 h-9 border-3 border-(--accent-soft) border-t-(--accent) rounded-full animate-spin mb-4" />
        <p className="text-sm text-(--muted) font-medium animate-pulse">
          Validando sessão...
        </p>
      </div>
    );
  }

  // Se não autenticado, redireciona para a tela de login preservando a rota desejada
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Se houver restrição por papéis e o usuário não possuir o papel permitido
  if (papeisPermitidos && papeisPermitidos.length > 0 && usuario?.papel) {
    const temPermissao = papeisPermitidos.includes(usuario.papel);
    if (!temPermissao) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-(--bg) p-6">
          <div
            className="max-w-md w-full bg-(--surface) border border-(--border) rounded-2xl p-6 text-center"
            style={{ boxShadow: "var(--shadow-2)" }}
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-(--fg) mb-1">
              Acesso Restrito
            </h2>
            <p className="text-sm text-(--muted) mb-6">
              Seu perfil de acesso (
              <span className="font-mono font-medium text-(--accent-ink)">
                {usuario.papel}
              </span>
              ) não possui privilégios para visualizar este recurso.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-(--accent) text-white hover:brightness-105 transition-all"
            >
              Voltar ao Dashboard
            </a>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
