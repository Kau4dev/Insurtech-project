import React, { useEffect, useRef, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { Logo } from "../../../components/ui";

export const PortalLayout: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);
  const menuUsuarioRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    sessionStorage.setItem("insurtech_logout", "true");
    logout();
    navigate("/portal/login");
  };

  // Fecha menus ao navegar
  useEffect(() => {
    setMenuMobileAberto(false);
    setMenuUsuarioAberto(false);
  }, [location.pathname]);

  // Trava scroll da tela quando menu mobile estiver aberto
  useEffect(() => {
    if (menuMobileAberto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuMobileAberto]);

  // Fecha menus com a tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuMobileAberto(false);
        setMenuUsuarioAberto(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fecha dropdown do usuário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuUsuarioRef.current &&
        !menuUsuarioRef.current.contains(e.target as Node)
      ) {
        setMenuUsuarioAberto(false);
      }
    };
    if (menuUsuarioAberto) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuUsuarioAberto]);

  // Iniciais do segurado para o avatar
  const iniciais =
    usuario?.nome
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("") || "JS";

  const navLinks = [
    {
      to: "/portal",
      label: "Início",
      exact: true,
      icon: (
        <svg
          className="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      to: "/portal/apolices",
      label: "Minhas Apólices",
      icon: (
        <svg
          className="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      to: "/portal/sinistros/novo",
      label: "Novo Sinistro",
      icon: (
        <svg
          className="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-dvh bg-(--bg) flex flex-col text-(--fg)">
      {/* Header Sticky com visual institucional e alta densidade */}
      <header className="sticky top-0 z-30 bg-(--surface)/95 backdrop-blur-md border-b border-(--border)">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Lado Esquerdo: Logo e Identidade do Portal */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/portal"
              className="flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-(--accent) rounded-lg p-0.5"
            >
              <Logo size="md" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-(--accent) tracking-tight group-hover:text-(--accent-ink) transition-colors">
                  InsurTech
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10.5px] font-medium tracking-wider uppercase rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  Portal do Segurado

                </span>
                
                
              </div>
            </Link>

            {/* Navegação Desktop (Telas Médias e Grandes) */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.slice(0, 2).map((link) => {
                const isActive = link.exact
                  ? location.pathname === link.to
                  : location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-(--accent-soft) text-(--accent-ink) font-semibold shadow-2xs border border-(--accent)/25"
                        : "text-(--muted) hover:text-(--fg) hover:bg-(--surface-2) border border-transparent"
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Lado Direito: Ações Rápidas, Perfil do Usuário e Menu Mobile */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* CTA Compacto para Mobile Pequeno */}
           

            <div className="hidden sm:block h-5 w-px bg-(--border)" />

            {/* Menu do Usuário (Desktop / Tablet) */}
            <div className="relative hidden sm:block" ref={menuUsuarioRef}>
              <button
                type="button"
                onClick={() => setMenuUsuarioAberto(!menuUsuarioAberto)}
                aria-expanded={menuUsuarioAberto}
                aria-haspopup="true"
                className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-(--surface-2) transition-all cursor-pointer border border-transparent hover:border-(--border) focus-visible:outline-2 focus-visible:outline-(--accent)"
              >
                <div className="w-8 h-8 rounded-full bg-(--accent-soft) text-(--accent-ink) font-bold text-xs flex items-center justify-center border border-(--accent)/25 shadow-2xs shrink-0 select-none">
                  {iniciais}
                </div>
                <div className="hidden lg:flex flex-col text-left leading-tight">
                  <span className="text-xs font-semibold text-(--fg) truncate max-w-32.5">
                    {usuario?.nome || "Segurado"}
                  </span>
                  <span className="text-[10px] text-(--muted) flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Cliente Segurado
                  </span>
                </div>
                <svg
                  className={`w-3.5 h-3.5 text-(--muted) transition-transform duration-200 ${
                    menuUsuarioAberto ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu Desktop */}
              {menuUsuarioAberto && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 bg-(--surface) border border-(--border) rounded-xl shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  style={{ boxShadow: "var(--shadow-2)" }}
                >
                  <div className="p-3 rounded-lg bg-(--surface-2)/60 border border-(--border) mb-1.5">
                    <p className="text-xs font-semibold text-(--fg) truncate">
                      {usuario?.nome || "Segurado"}
                    </p>
                    <p className="text-[11px] text-(--muted) font-mono truncate mt-0.5">
                      {usuario?.email}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase text-(--accent-ink)">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Conta Verificada
                    </div>
                  </div>

                  <div className="space-y-0.5 py-1">
                    <Link
                      to="/portal"
                      onClick={() => setMenuUsuarioAberto(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-(--fg) hover:bg-(--surface-2) transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-(--muted)"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      <span>Início do Portal</span>
                    </Link>

                    <Link
                      to="/portal/apolices"
                      onClick={() => setMenuUsuarioAberto(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-(--fg) hover:bg-(--surface-2) transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-(--muted)"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>Minhas Apólices</span>
                    </Link>

                    <Link
                      to="/portal/sinistros/novo"
                      onClick={() => setMenuUsuarioAberto(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-(--accent-ink) hover:bg-(--accent-soft)/60 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-(--accent-ink)"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                      <span>Acionar Novo Sinistro</span>
                    </Link>
                  </div>

                  <div className="pt-1.5 mt-1 border-t border-(--border)">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Sair da Conta</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Botão Hambúrguer Mobile (< md) */}
            <button
              type="button"
              onClick={() => setMenuMobileAberto(!menuMobileAberto)}
              aria-label={
                menuMobileAberto
                  ? "Fechar menu de navegação"
                  : "Abrir menu de navegação"
              }
              aria-expanded={menuMobileAberto}
              className="md:hidden min-w-10 min-h-10 p-2 rounded-lg text-(--fg) hover:bg-(--surface-2) active:bg-(--surface-2) transition-colors flex items-center justify-center cursor-pointer border border-(--border) focus-visible:outline-2 focus-visible:outline-(--accent)"
            >
              {menuMobileAberto ? (
                <svg
                  className="w-5 h-5 text-(--fg)"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-(--fg)"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menu Drawer Mobile & Backdrop (< md) */}
      {menuMobileAberto && (
        <>
          <div
            className="fixed inset-0 top-16 bg-black/40 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setMenuMobileAberto(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navegação móvel do portal do segurado"
            className="fixed top-16 left-0 right-0 max-h-[calc(100dvh-4rem)] overflow-y-auto bg-(--surface) border-b border-(--border) shadow-2xl z-50 p-4 space-y-4 md:hidden"
          >
            {/* Card do Usuário Autenticado */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-(--surface-2)/60 border border-(--border)">
              <div className="w-11 h-11 rounded-full bg-(--accent-soft) text-(--accent-ink) font-bold text-sm flex items-center justify-center border border-(--accent)/25 shadow-2xs shrink-0 select-none">
                {iniciais}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-(--fg) truncate">
                  {usuario?.nome || "Segurado"}
                </div>
                <div className="text-xs text-(--muted) font-mono truncate">
                  {usuario?.email}
                </div>
                <div className="mt-1 inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase text-(--accent-ink)">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Portal do Segurado • Conectado
                </div>
              </div>
            </div>

            {/* Links de Navegação com Alvos de Toque Adequados */}
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const isActive = link.exact
                  ? location.pathname === link.to
                  : location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuMobileAberto(false)}
                    className={`w-full min-h-11 px-3.5 py-2.5 rounded-xl flex items-center justify-between text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-(--accent-soft) text-(--accent-ink) font-semibold border border-(--accent)/25"
                        : "text-(--fg) hover:bg-(--surface-2) active:bg-(--surface-2) border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          isActive ? "text-(--accent-ink)" : "text-(--muted)"
                        }
                      >
                        {link.icon}
                      </span>
                      <span>{link.label}</span>
                    </div>
                    <svg
                      className="w-4 h-4 text-(--muted)"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                );
              })}
            </nav>

            {/* Botão de Ação Rápida: Abrir Novo Sinistro */}
            <Link
              to="/portal/sinistros/novo"
              onClick={() => setMenuMobileAberto(false)}
              className="w-full h-11 rounded-lg bg-(--accent) hover:bg-(--accent-ink) active:scale-[0.99] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span>Abrir Novo Sinistro</span>
            </Link>

            {/* Suporte e Atendimento ao Cliente */}
            <div className="p-3.5 rounded-xl bg-(--surface-2)/40 border border-(--border) text-xs space-y-1">
              <div className="font-semibold text-(--fg) flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-(--accent-ink)"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>Central de Atendimento 24h</span>
              </div>
              <p className="text-(--muted) leading-relaxed">
                Dúvidas ou emergência? Ligue gratuitamente para{" "}
                <span className="font-mono font-medium text-(--fg)">
                  0800 700 4000
                </span>
                .
              </p>
            </div>

            {/* Ação de Desconexão (Sair da Conta) */}
            <div className="pt-2 border-t border-(--border)">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full h-11 rounded-lg text-red-600 dark:text-red-400 bg-red-500/5 hover:bg-red-500/10 active:bg-red-500/15 border border-red-500/20 font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Conteúdo Principal com espaçamento responsivo */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};
