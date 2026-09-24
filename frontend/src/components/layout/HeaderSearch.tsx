import React, { useEffect, useRef, useState, useTransition } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apolicesApi } from "../../api/apolicesApi";
import { seguradoApi } from "../../api/seguradosApi";
import { sinistrosApi } from "../../api/sinistrosApi";
import type { Apolice } from "../../interfaces/apolices/apolice";
import type { Segurado } from "../../interfaces/segurados/segurado";
import type { Sinistro } from "../../interfaces/sinistros/sinistro";
import {
  formatarStatusApolice,
  formatarStatusSinistro,
  formatarTipoPessoa,
  formatarTipoSeguro,
  formatarTipoSinistro,
  getApoliceStatusBadgeVariant,
  getPessoaTipoBadgeVariant,
  getSinistroStatusBadgeVariant,
} from "../../utils/enumUtils";
import {
  formatarCpfCnpj,
  formatarData,
  formatarMoeda,
} from "../../utils/formatters";
import { Badge } from "../ui/Badge";

type SearchResultItem =
  | { tipo: "sinistro"; item: Sinistro }
  | { tipo: "apolice"; item: Apolice }
  | { tipo: "segurado"; item: Segurado };

export const HeaderSearch: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [, startTransition] = useTransition();

  const [termo, setTermo] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const [sinistros, setSinistros] = useState<Sinistro[]>([]);
  const [apolices, setApolices] = useState<Apolice[]>([]);
  const [segurados, setSegurados] = useState<Segurado[]>([]);
  const atalhoTexto =
    typeof navigator !== "undefined" &&
    /(Mac|iPhone|iPod|iPad)/i.test(
      navigator.platform || navigator.userAgent || "",
    )
      ? "⌘K"
      : "Ctrl+K";

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  // Atalho global (Ctrl+K ou '/') para focar a barra de pesquisa
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" ||
          ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Executa a busca nos endpoints da API
  const executarBusca = async (texto: string) => {
    const q = texto.trim();

    if (!q) {
      setSinistros([]);
      setApolices([]);
      setSegurados([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const [resSin, resApo, resSeg] = await Promise.allSettled([
        sinistrosApi.listar({ numeroSinistro: q, size: 5 }),
        apolicesApi.listar({ numeroApolice: q, size: 5 }),
        seguradoApi.listar({ nome: q, size: 5 }),
      ]);

      if (resSin.status === "fulfilled" && resSin.value?.content) {
        setSinistros(resSin.value.content.slice(0, 5));
      } else {
        setSinistros([]);
      }

      if (resApo.status === "fulfilled" && resApo.value?.content) {
        setApolices(resApo.value.content.slice(0, 5));
      } else {
        setApolices([]);
      }

      if (resSeg.status === "fulfilled" && resSeg.value?.content) {
        setSegurados(resSeg.value.content.slice(0, 5));
      } else {
        setSegurados([]);
      }
    } catch (err) {
      console.error("Erro ao buscar dados na API:", err);
      setSinistros([]);
      setApolices([]);
      setSegurados([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTermo(val);
    setActiveIndex(-1);
    setIsOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim()) {
      setSinistros([]);
      setApolices([]);
      setSegurados([]);
      setIsLoading(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      startTransition(() => {
        executarBusca(val);
      });
    }, 180);
  };

  // Monta lista linear para navegação por teclado
  const totalResults: SearchResultItem[] = [
    ...sinistros.map((s): SearchResultItem => ({ tipo: "sinistro", item: s })),
    ...apolices.map((a): SearchResultItem => ({ tipo: "apolice", item: a })),
    ...segurados.map(
      (seg): SearchResultItem => ({ tipo: "segurado", item: seg }),
    ),
  ];

  const handleSelectItem = (itemObj: SearchResultItem) => {
    setIsOpen(false);
    if (itemObj.tipo === "sinistro") {
      navigate(
        `/sinistros?busca=${encodeURIComponent(itemObj.item.numeroSinistro)}&detalheId=${itemObj.item.id || itemObj.item.numeroSinistro}`,
      );
    } else if (itemObj.tipo === "apolice") {
      navigate(
        `/apolices?busca=${encodeURIComponent(itemObj.item.numeroApolice)}&detalheId=${itemObj.item.id || itemObj.item.numeroApolice}`,
      );
    } else if (itemObj.tipo === "segurado") {
      navigate(
        `/segurados?busca=${encodeURIComponent(itemObj.item.nomeRazaoSocial)}&detalheId=${itemObj.item.id || itemObj.item.nomeRazaoSocial}`,
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!isOpen || totalResults.length === 0) {
      if (e.key === "Enter" && termo.trim()) {
        e.preventDefault();
        setIsOpen(false);
        const q = termo.trim();
        // Redireciona de forma inteligente
        if (location.pathname.startsWith("/sinistros")) {
          navigate(`/sinistros?busca=${encodeURIComponent(q)}`);
        } else if (location.pathname.startsWith("/apolices")) {
          navigate(`/apolices?busca=${encodeURIComponent(q)}`);
        } else if (location.pathname.startsWith("/segurados")) {
          navigate(`/segurados?busca=${encodeURIComponent(q)}`);
        } else if (q.toUpperCase().startsWith("SIN")) {
          navigate(`/sinistros?busca=${encodeURIComponent(q)}`);
        } else if (q.toUpperCase().startsWith("AP")) {
          navigate(`/apolices?busca=${encodeURIComponent(q)}`);
        } else {
          navigate(`/sinistros?busca=${encodeURIComponent(q)}`);
        }
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < totalResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < totalResults.length) {
        handleSelectItem(totalResults[activeIndex]);
      } else if (totalResults.length > 0) {
        handleSelectItem(totalResults[0]);
      } else {
        setIsOpen(false);
        navigate(`/sinistros?busca=${encodeURIComponent(termo.trim())}`);
      }
    }
  };

  const limparBusca = () => {
    setTermo("");
    setSinistros([]);
    setApolices([]);
    setSegurados([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const totalCount = sinistros.length + apolices.length + segurados.length;
  let currentIndexTracker = -1;

  return (
    <div className="relative w-60 sm:w-72 lg:w-84" ref={containerRef}>
      {/* Campo de Busca do Header */}
      <div className="relative flex items-center">
        <svg
          className="absolute left-2.5 w-4 h-4 text-(--muted) pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="M20 20l-3.6-3.6" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={termo}
          onChange={handleInputChange}
          onFocus={() => {
            if (termo.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full pl-9 pr-14 py-1.5 text-[13px] placeholder:text-(--muted) border border-(--border) rounded-lg bg-(--surface-2) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all text-(--fg)"
          placeholder="Buscar nº do sinistro, apólice ou CNPJ…"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />

        {/* Indicador de Atalho ou Botão Limpar */}
        <div className="absolute right-2 flex items-center gap-1">
          {isLoading ? (
            <svg
              className="animate-spin w-3.5 h-3.5 text-(--muted)"
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
          ) : termo ? (
            <button
              type="button"
              onClick={limparBusca}
              className="text-(--muted) hover:text-(--fg) p-0.5 rounded cursor-pointer transition-colors"
              title="Limpar pesquisa"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <kbd
              className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-(--muted) bg-(--surface) border border-(--border) rounded shadow-2xs select-none cursor-default"
              title={`Pressione ${atalhoTexto} ou / para pesquisar`}
            >
              {atalhoTexto}
            </kbd>
          )}
        </div>
      </div>

      {/* Popover / Dropdown de Resultados da Busca */}
      {isOpen && termo.trim().length > 0 && (
        <div
          className="fixed left-4 right-4 sm:left-auto sm:right-0 sm:absolute top-16 sm:top-full sm:mt-2 sm:w-115 max-h-[calc(100vh-5.5rem)] sm:max-h-125 bg-(--surface) border border-(--border) rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100"
          style={{ boxShadow: "var(--shadow-2)" }}
        >
          {/* Cabeçalho do Popover */}
          <div className="shrink-0 px-3.5 py-2.5 bg-(--surface-2)/60 border-b border-(--border) flex items-center justify-between text-xs">
            <span className="text-(--muted) font-medium">
              {isLoading ? (
                "Pesquisando na plataforma…"
              ) : totalCount > 0 ? (
                <>
                  <strong className="text-(--fg)">{totalCount}</strong>{" "}
                  resultado{totalCount > 1 ? "s" : ""} encontrado
                  {totalCount > 1 ? "s" : ""}
                </>
              ) : (
                "Nenhum resultado"
              )}
            </span>
            <span className="text-[11px] text-(--muted) font-mono">
              termo: &ldquo;{termo}&rdquo;
            </span>
          </div>

          {/* Lista de Resultados com Rolagem */}
          <div className="flex-1 overflow-y-auto divide-y divide-(--border)/60 p-1.5">
            {totalCount === 0 && !isLoading && (
              <div className="py-8 px-4 text-center">
                <svg
                  className="w-9 h-9 mx-auto text-(--muted)/60 mb-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="M20 20l-3.6-3.6" />
                </svg>
                <p className="text-sm font-medium text-(--fg)">
                  Nenhum registro encontrado
                </p>
                <p className="text-xs text-(--muted) mt-1 max-w-xs mx-auto">
                  Tente buscar pelo código (ex:{" "}
                  <span className="font-mono text-(--fg)">SIN-2026-0001</span>,{" "}
                  <span className="font-mono text-(--fg)">AP-2026-0001</span>),
                  nome do segurado ou CNPJ.
                </p>
              </div>
            )}

            {/* Grupo 1: Sinistros */}
            {sinistros.length > 0 && (
              <div className="py-1">
                <div className="px-2.5 py-1 text-[11px] font-semibold tracking-wider text-(--accent-ink) uppercase flex items-center justify-between">
                  <span>Sinistros</span>
                  <span className="text-[10px] text-(--muted) font-normal font-mono">
                    {sinistros.length}
                  </span>
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {sinistros.map((s) => {
                    currentIndexTracker++;
                    const isSelected = activeIndex === currentIndexTracker;
                    return (
                      <div
                        key={s.id || s.numeroSinistro}
                        onClick={() =>
                          handleSelectItem({ tipo: "sinistro", item: s })
                        }
                        className={`group px-2.5 py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-(--accent-soft) text-(--fg)"
                            : "hover:bg-(--surface-2) text-(--fg)"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold group-hover:text-(--accent-ink)">
                              {s.numeroSinistro}
                            </span>
                            <Badge
                              variant={getSinistroStatusBadgeVariant(s.status)}
                            >
                              {formatarStatusSinistro(s.status)}
                            </Badge>
                          </div>
                          <div className="text-[11.5px] text-(--muted) truncate mt-0.5 flex items-center gap-1.5">
                            <span>{formatarTipoSinistro(s.tipoSinistro)}</span>
                            <span>•</span>
                            <span className="font-mono">
                              {formatarMoeda(s.valorEstimado)}
                            </span>
                            {s.dataOcorrencia && (
                              <>
                                <span>•</span>
                                <span>{formatarData(s.dataOcorrencia)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <svg
                          className="w-4 h-4 text-(--muted) group-hover:text-(--fg) shrink-0 transition-transform group-hover:translate-x-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grupo 2: Apólices */}
            {apolices.length > 0 && (
              <div className="py-1">
                <div className="px-2.5 py-1 text-[11px] font-semibold tracking-wider text-(--accent-ink) uppercase flex items-center justify-between">
                  <span>Apólices</span>
                  <span className="text-[10px] text-(--muted) font-normal font-mono">
                    {apolices.length}
                  </span>
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {apolices.map((a) => {
                    currentIndexTracker++;
                    const isSelected = activeIndex === currentIndexTracker;
                    return (
                      <div
                        key={a.id || a.numeroApolice}
                        onClick={() =>
                          handleSelectItem({ tipo: "apolice", item: a })
                        }
                        className={`group px-2.5 py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-(--accent-soft) text-(--fg)"
                            : "hover:bg-(--surface-2) text-(--fg)"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold group-hover:text-(--accent-ink)">
                              {a.numeroApolice}
                            </span>
                            <Badge
                              variant={getApoliceStatusBadgeVariant(a.status)}
                            >
                              {formatarStatusApolice(a.status)}
                            </Badge>
                          </div>
                          <div className="text-[11.5px] text-(--muted) truncate mt-0.5 flex items-center gap-1.5">
                            <span>{formatarTipoSeguro(a.tipoSeguro)}</span>
                            <span>•</span>
                            <span className="font-mono">
                              {formatarMoeda(a.valorSeguro)}
                            </span>
                          </div>
                        </div>
                        <svg
                          className="w-4 h-4 text-(--muted) group-hover:text-(--fg) shrink-0 transition-transform group-hover:translate-x-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grupo 3: Segurados */}
            {segurados.length > 0 && (
              <div className="py-1">
                <div className="px-2.5 py-1 text-[11px] font-semibold tracking-wider text-(--accent-ink) uppercase flex items-center justify-between">
                  <span>Segurados</span>
                  <span className="text-[10px] text-(--muted) font-normal font-mono">
                    {segurados.length}
                  </span>
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {segurados.map((seg) => {
                    currentIndexTracker++;
                    const isSelected = activeIndex === currentIndexTracker;
                    return (
                      <div
                        key={seg.id || seg.cpfCnpj}
                        onClick={() =>
                          handleSelectItem({ tipo: "segurado", item: seg })
                        }
                        className={`group px-2.5 py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-(--accent-soft) text-(--fg)"
                            : "hover:bg-(--surface-2) text-(--fg)"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold group-hover:text-(--accent-ink) truncate">
                              {seg.nomeRazaoSocial}
                            </span>
                            <Badge
                              variant={getPessoaTipoBadgeVariant(
                                seg.tipoPessoa,
                              )}
                            >
                              {formatarTipoPessoa(seg.tipoPessoa)}
                            </Badge>
                          </div>
                          <div className="text-[11.5px] text-(--muted) truncate mt-0.5 flex items-center gap-1.5 font-mono">
                            <span>
                              {formatarCpfCnpj(seg.cpfCnpj, seg.tipoPessoa)}
                            </span>
                            <span>•</span>
                            <span className="truncate">{seg.email}</span>
                          </div>
                        </div>
                        <svg
                          className="w-4 h-4 text-(--muted) group-hover:text-(--fg) shrink-0 transition-transform group-hover:translate-x-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Rodapé com Atalhos de Teclado */}
          <div className="shrink-0 px-3.5 py-2 bg-(--surface-2)/80 border-t border-(--border) flex items-center justify-between text-[11px] text-(--muted)">
            <span>
              Pressione{" "}
              <kbd className="font-mono font-semibold text-(--fg)">↵ Enter</kbd>{" "}
              para abrir
            </span>
            <div className="flex items-center gap-2">
              <span>
                <kbd className="font-mono">↑↓</kbd> navegar
              </span>
              <span>•</span>
              <span>
                <kbd className="font-mono">ESC</kbd> fechar
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
