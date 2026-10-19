import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Logo } from "../components/ui";
import { useAuth } from "../context/useAuth";

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, usuario } = useAuth();

  const isSegurado = usuario?.papel === "SEGURADO";

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-(--bg) text-(--fg) px-4 py-6 sm:p-8">
      {/* Topo institucional com Logo */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between pb-6 border-b border-(--border)">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <div>
            <span className="text-sm font-bold text-(--fg) tracking-tight block">
              InsurTech
            </span>
            <span className="text-[11px] font-mono text-(--muted) uppercase tracking-wider block">
              Plataforma Corporativa & Portal do Segurado
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            HTTP 404
          </span>
        </div>
      </header>

      {/* Conteúdo central elegante */}
      <main className="max-w-xl w-full mx-auto my-auto py-12 text-center">
        {/* Ícone de bússola / erro institucional */}
        <div className="w-16 h-16 rounded-2xl bg-(--surface) border border-(--border-strong)/60 shadow-xs flex items-center justify-center mx-auto mb-6 text-(--accent-ink)">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.7}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-(--accent-ink) block mb-2">
          Recurso não localizado
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-(--fg) mb-3">
          Página não encontrada
        </h1>
        <p className="text-sm sm:text-[15px] text-(--muted) leading-relaxed max-w-md mx-auto mb-6">
          O endereço que você tentou acessar não existe, foi alterado ou está
          temporariamente indisponível no sistema.
        </p>

        {/* Exibição da rota tentada */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--surface) border border-(--border) text-xs text-(--muted) mb-8 max-w-full">
          <span className="font-semibold text-(--muted) shrink-0">Rota:</span>
          <span className="font-mono text-(--accent-ink) font-medium truncate">
            {location.pathname}
          </span>
        </div>

        {/* Ações contextuais de retorno */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          {isAuthenticated ? (
            isSegurado ? (
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
                onClick={() => navigate("/portal")}
              >
                Ir para o Portal do Segurado →
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
                onClick={() => navigate("/dashboard")}
              >
                Voltar ao Dashboard Operacional →
              </Button>
            )
          ) : (
            <>
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
                onClick={() => navigate("/login")}
              >
                Acessar Painel Corporativo →
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="w-full sm:w-auto"
                onClick={() => navigate("/portal/login")}
              >
                Portal do Segurado
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="md"
            className="w-full sm:w-auto text-(--muted) hover:text-(--fg)"
            onClick={() => navigate(-1)}
          >
            ← Voltar à anterior
          </Button>
        </div>

        {/* Links rápidos para módulos conhecidos caso usuário corporativo */}
        {isAuthenticated && !isSegurado && (
          <div className="mt-8 pt-6 border-t border-(--border)/60 flex flex-wrap items-center justify-center gap-4 text-xs text-(--muted)">
            <span className="font-medium">Navegação rápida:</span>
            <Link to="/sinistros" className="hover:text-(--accent-ink) underline underline-offset-4 transition-colors">
              Sinistros
            </Link>
            <span className="text-(--border)">•</span>
            <Link to="/apolices" className="hover:text-(--accent-ink) underline underline-offset-4 transition-colors">
              Apólices
            </Link>
            <span className="text-(--border)">•</span>
            <Link to="/segurados" className="hover:text-(--accent-ink) underline underline-offset-4 transition-colors">
              Segurados
            </Link>
          </div>
        )}
      </main>

      {/* Rodapé institucional */}
      <footer className="max-w-5xl w-full mx-auto pt-6 border-t border-(--border) flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-(--muted)">
        <p>© {new Date().getFullYear()} InsurTech. Todos os direitos reservados.</p>
        <div className="flex items-center gap-4 text-xs">
          <span>Suporte: <span className="font-mono text-(--accent-ink)">helpdesk@insurtech.com.br</span></span>
          <span className="hidden sm:inline text-(--border)">•</span>
          <span>Central: <span className="font-mono text-(--accent-ink)">0800 123 4567</span></span>
        </div>
      </footer>
    </div>
  );
};
