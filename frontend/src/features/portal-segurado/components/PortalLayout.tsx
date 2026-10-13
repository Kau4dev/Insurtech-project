import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { Button } from "../../../components/ui";

export const PortalLayout: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.setItem("insurtech_logout", "true");
    logout();
    navigate("/portal/login");
  };


  const navLinks = [
    { to: "/portal", label: "Início", exact: true },
    { to: "/portal/apolices", label: "Minhas Apólices" },
    { to: "/portal/sinistros/novo", label: "Novo Sinistro" },
  ];

  return (
    <div className="min-h-screen bg-(--bg) flex flex-col text-(--fg)">
      <header className="border-b border-(--border) bg-(--surface) px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/portal" className="flex items-center gap-2">
              <span className="font-bold text-lg text-(--accent)">InsurTech</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-(--accent-soft) text-(--accent-ink) font-medium">
                Portal do Segurado
              </span>
            </Link>

            <nav className="hidden sm:flex items-center gap-1 text-xs font-medium">
              {navLinks.map((link) => {
                const isActive = link.exact
                  ? location.pathname === link.to
                  : location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-(--accent-soft) text-(--accent-ink) font-semibold"
                        : "text-(--muted) hover:text-(--fg) hover:bg-(--surface-2)"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-(--muted) hidden sm:inline">
              {usuario?.nome || usuario?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};
