import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export interface NotificacaoItem {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "sucesso" | "info" | "alerta" | "aviso";
  tempo: string;
  lida: boolean;
  link?: string;
}

export const NotificationsPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const naoLidasCount = notificacoes.filter((n) => !n.lida).length;

  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickFora);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickFora);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const marcarComoLida = (id: string) => {
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n)),
    );
  };

  const marcarTodasComoLidas = () => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const limparTodas = () => {
    setNotificacoes([]);
  };

  const handleItemClick = (item: NotificacaoItem) => {
    marcarComoLida(item.id);
    setIsOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const renderIcon = (tipo: NotificacaoItem["tipo"]) => {
    switch (tipo) {
      case "sucesso":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "aviso":
        return (
          <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        );
      case "alerta":
        return (
          <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        );
      case "info":
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Botão de Notificações com Badge */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-lg text-(--muted) hover:bg-(--surface-2) hover:text-(--fg) transition-colors cursor-pointer"
        aria-label="Abrir notificações"
        aria-expanded={isOpen}
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>

        {naoLidasCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-(--accent) text-white text-[10px] font-bold leading-none ring-2 ring-(--surface)">
            {naoLidasCount}
          </span>
        )}
      </button>

      {/* Popover / Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-84 sm:w-96 max-w-[calc(100vw-2rem)] bg-(--surface) border border-(--border) rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
          style={{ boxShadow: "var(--shadow-2)" }}
        >
          {/* Header do Popover */}
          <div className="px-4 py-3 border-b border-(--border) flex items-center justify-between bg-(--surface)">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-(--fg)">
                Notificações
              </span>
              {naoLidasCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-(--accent-soft) text-(--accent-ink)">
                  {naoLidasCount} nova{naoLidasCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {naoLidasCount > 0 && (
                <button
                  type="button"
                  onClick={marcarTodasComoLidas}
                  className="text-[12px] font-medium text-(--accent-ink) hover:underline cursor-pointer"
                >
                  Marcar como lidas
                </button>
              )}
              {notificacoes.length > 0 && (
                <button
                  type="button"
                  onClick={limparTodas}
                  className="text-[12px] font-medium text-(--muted) hover:text-(--fg) cursor-pointer"
                  title="Limpar todas as notificações"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Lista de Notificações */}
          <div className="max-h-88 overflow-y-auto divide-y divide-(--border)">
            {notificacoes.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-(--surface-2) text-(--muted) mx-auto flex items-center justify-center mb-2.5">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.7}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <p className="text-xs font-medium text-(--fg)">
                  Tudo limpo por aqui
                </p>
                <p className="text-[11.5px] text-(--muted) mt-0.5">
                  Nenhuma notificação pendente no momento.
                </p>
              </div>
            ) : (
              notificacoes.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-(--surface-2) ${
                    !item.lida ? "bg-(--accent-soft)/25" : ""
                  }`}
                >
                  {renderIcon(item.tipo)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p
                        className={`text-[13px] font-medium truncate ${!item.lida ? "text-(--fg) font-semibold" : "text-(--fg)"}`}
                      >
                        {item.titulo}
                      </p>
                      <span className="text-[10.5px] text-(--muted) shrink-0 font-mono">
                        {item.tempo}
                      </span>
                    </div>
                    <p className="text-[12px] text-(--muted) leading-snug line-clamp-2">
                      {item.descricao}
                    </p>
                  </div>
                  {!item.lida && (
                    <span
                      className="w-2 h-2 rounded-full bg-(--accent) shrink-0 mt-1.5"
                      title="Não lida"
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Rodapé do Popover */}
          <div className="px-3.5 py-2 border-t border-(--border) bg-(--surface-2)/60 text-center">
            <span className="text-[11px] text-(--muted)">
              Notificações de eventos e mensagens da plataforma
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
