import React from "react";
import { useAuth } from "../../context/useAuth";
import { useApolices } from "../../features/apolices";
import { useSinistros } from "../../features/sinistros";
import { Button, Logo } from "../ui";
import { NavItem } from "./NavItem";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
}) => {
  const { usuario, logout } = useAuth();
  const { data: sinistrosData } = useSinistros();
  const { data: apolicesData } = useApolices();

  const totalSinistros = sinistrosData?.totalElements;
  const totalApolices = apolicesData?.totalElements;

  const getInitials = (name?: string) => {
    if (!name) return "US";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("");
  };

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <rect x="3" y="3" width="8" height="9" rx="1.5" />
          <rect x="13" y="3" width="8" height="5" rx="1.5" />
          <rect x="13" y="10" width="8" height="11" rx="1.5" />
          <rect x="3" y="14" width="8" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      to: "/sinistros",
      label: "Sinistros",
      count: totalSinistros,
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path d="M14 3v5h5" />
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M9 13h6M9 16h4" />
        </svg>
      ),
    },
    {
      to: "/apolices",
      label: "Apólices",
      count: totalApolices,
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      ),
    },
    {
      to: "/segurados",
      label: "Segurados",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <circle cx="9.5" cy="8" r="3.5" />
          <path d="M3.5 20a6 6 0 0 1 12 0" />
          <circle cx="17.5" cy="9.5" r="2.4" />
          <path d="M16 16.5a5 5 0 0 1 5 3.5" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Overlay escuro no mobile ao abrir o menu */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 h-screen flex flex-col bg-(--surface) border-r border-(--border) pt-5 px-3.5 pb-4 select-none transition-transform duration-200 ease-in-out w-64 md:w-56 lg:w-64 md:shrink-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Marca / Brand + Botão de fechar no mobile */}
        <div className="flex items-center justify-between px-2 pb-5">
          <div className="flex gap-2.5 items-center">
            <Logo size="md" />
            <div>
              <div className="text-[14.5px] font-[650] tracking-[0.01em] leading-[1.2] text-(--fg)">
                InsurTech
              </div>
              <div className="text-[11.5px] text-(--faint) tracking-[0.02em]">
                Gestão de sinistros
              </div>
            </div>
          </div>

          {/* Botão fechar apenas no mobile */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-(--surface-2) text-(--muted) hover:text-(--fg) md:hidden transition-colors"
            aria-label="Fechar menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navegação principal */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
          <div className="text-[11px] tracking-[0.09em] uppercase text-(--faint) pt-3.5 px-2.5 pb-1.5 font-[620]">
            Operações
          </div>

          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              count={item.count}
              onClick={onClose}
            />
          ))}

          <div className="text-[11px] tracking-[0.09em] uppercase text-(--faint) pt-5 px-2.5 pb-1.5 font-[620]">
            Plataforma
          </div>

          <NavItem
            disabled
            label="Usuários e papéis"
            title="Módulo de usuários e papéis previsto para a fase 4"
            icon={
              <svg
                //className="text-(--accent-ink) "
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
              </svg>
            }
            onClick={() => {
              alert(
                "Módulo de usuários e papéis previsto para a fase 4 (auth-service).",
              );
            }}
          />
        </nav>

        {/* Rodapé / Usuário & Ação de Logout */}
        <div className="pt-4 border-t border-(--border) mt-auto flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-(--surface-2) border border-(--border) flex items-center justify-center font-medium text-xs text-(--fg)">
              {getInitials(usuario?.nome)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-[550] text-(--fg) truncate">
                {usuario?.nome || "Usuário"}
              </div>
            </div>
          </div>

          {usuario?.papel && (
            <div className="px-2">
              <span className="inline-block text-[10.5px] font-mono font-medium px-2 py-0.5 rounded-md bg-(--accent-soft)">
                {usuario.papel}
              </span>
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-1"
            onClick={() => {
              sessionStorage.setItem("insurtech_logout", "true");
              logout();
            }}
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
              >
                <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
              </svg>
            }
          >
            Sair do sistema
          </Button>
        </div>
      </aside>
    </>
  );
};
