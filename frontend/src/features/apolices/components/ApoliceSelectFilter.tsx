import React, { useEffect, useRef, useState } from "react";
import { Badge, SearchInput } from "../../../components/ui";
import type { Apolice } from "../../../interfaces/apolices/apolice";
import {
  formatarStatusApolice,
  formatarTipoSeguro,
  getApoliceStatusBadgeVariant,
} from "../../../utils/enumUtils";
import { formatarData, formatarMoeda } from "../../../utils/formatters";
import { SeguradoNome } from "../../segurados/components/SeguradoNome";
import { useApolicePorId, useApolices } from "../hooks/useApolices";

export interface ApoliceSelectFilterProps {
  value?: string;
  onChange: (apoliceId: string, apolice?: Apolice | null) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}

export const ApoliceSelectFilter: React.FC<ApoliceSelectFilterProps> = ({
  value,
  onChange,
  disabled = false,
  error,
  label = "Apólice Vinculada",
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [termo, setTermo] = useState("");
  const [debouncedTermo, setDebouncedTermo] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce para busca no backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTermo(termo);
    }, 250);
    return () => clearTimeout(timer);
  }, [termo]);

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

  // Fecha com tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Carrega apólices (da busca ou padrão)
  const { data: apolicesData, isLoading } = useApolices({
    numeroApolice: debouncedTermo.trim() || undefined,
    size: 10,
  });

  const apolices = apolicesData?.content || [];

  // Busca apólice individual se não estiver na listagem carregada
  const { data: apoliceIndividual } = useApolicePorId(
    value && value.trim().length > 0 && !apolices.some((a) => a.id === value)
      ? value
      : undefined,
  );

  const apoliceSelecionada =
    value && value.trim().length > 0
      ? apolices.find((a) => a.id === value) || apoliceIndividual
      : undefined;

  // Filtro local instantâneo (número, tipo ou status)
  const termoLower = termo.toLowerCase().trim();

  const apolicesExibidas = apolices.filter((a) => {
    if (!termoLower) return true;
    const matchNumero = a.numeroApolice?.toLowerCase().includes(termoLower);
    const matchTipo =
      a.tipoSeguro?.toLowerCase().includes(termoLower) ||
      formatarTipoSeguro(a.tipoSeguro).toLowerCase().includes(termoLower);
    const matchStatus =
      a.status?.toLowerCase().includes(termoLower) ||
      formatarStatusApolice(a.status).toLowerCase().includes(termoLower);
    return matchNumero || matchTipo || matchStatus;
  });

  const handleSelect = (apolice: Apolice) => {
    onChange(apolice.id || "", apolice);
    setIsOpen(false);
    setTermo("");
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block font-medium text-xs text-(--fg) tracking-wider mb-1">
          {label} {required && "*"}
        </label>
      )}

      {/* Apólice já selecionada */}
      {apoliceSelecionada?.id && !isOpen ? (
        <div className="space-y-2">
          <div
            onClick={() => !disabled && setIsOpen(true)}
            className={`p-3 rounded-lg border bg-(--surface-2)/60 text-xs flex items-center justify-between gap-3 ${
              error ? "border-(--danger)" : "border-(--border)"
            } ${disabled ? "opacity-80" : "cursor-pointer hover:border-(--accent)/50"}`}
            title={disabled ? undefined : "Clique para alterar a apólice"}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Badge
                variant={getApoliceStatusBadgeVariant(
                  apoliceSelecionada.status,
                )}
              >
                {formatarStatusApolice(apoliceSelecionada.status)}
              </Badge>
              <span className="font-semibold text-sm text-(--fg) truncate">
                {apoliceSelecionada.numeroApolice}
              </span>
              <span className="text-(--muted)">•</span>
              <span className="text-xs text-(--muted) shrink-0">
                {formatarTipoSeguro(apoliceSelecionada.tipoSeguro)}
              </span>
              {apoliceSelecionada.valorSeguro && (
                <>
                  <span className="text-(--muted)">•</span>
                  <span className="mono text-xs text-(--muted) shrink-0">
                    Valor: {formatarMoeda(apoliceSelecionada.valorSeguro)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Alerta se apólice não for ATIVA */}
          {apoliceSelecionada.status &&
            apoliceSelecionada.status !== "ATIVA" && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0 text-amber-600"
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
                <span>
                  <strong>Regra de Negócio:</strong> Esta apólice está{" "}
                  <strong>
                    {formatarStatusApolice(apoliceSelecionada.status)}
                  </strong>
                  . O sistema exige uma apólice <strong>ATIVA</strong> para
                  aprovação do registro.
                </span>
              </div>
            )}
        </div>
      ) : (
        /* Campo de busca com filtro */
        <div className="relative">
          <SearchInput
            value={termo}
            onValueChange={(val) => {
              setTermo(val);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Digite o número da apólice, tipo ou status para buscar..."
            disabled={disabled}
            className={error ? "border-(--danger)" : ""}
          />

          {isOpen && !disabled && (
            <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-(--surface) border border-(--border) rounded-lg shadow-xl divide-y divide-(--border)/40">
              {isLoading ? (
                <div className="p-3 text-xs text-(--muted) text-center">
                  Buscando apólices...
                </div>
              ) : apolicesExibidas.length === 0 ? (
                <div className="p-3 text-xs text-(--muted) text-center">
                  Nenhuma apólice encontrada{termo ? ` para "${termo}"` : ""}.
                </div>
              ) : (
                apolicesExibidas.map((a) => {
                  const isCurrent = a.id === value;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => handleSelect(a)}
                      className={`w-full text-left px-3 py-2.5 hover:bg-(--surface-2) transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                        isCurrent ? "bg-(--accent)/10 font-medium" : ""
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getApoliceStatusBadgeVariant(a.status)}
                          >
                            {formatarStatusApolice(a.status)}
                          </Badge>
                          <span className="font-medium text-sm text-(--fg) truncate">
                            {a.numeroApolice}
                          </span>
                        </div>
                        <div className="text-xs text-(--muted) flex items-center gap-1.5">
                          <span>{formatarTipoSeguro(a.tipoSeguro)}</span>
                          {a.seguradoId && (
                            <>
                              <span>•</span>
                              <span>
                                Segurado:{" "}
                                <SeguradoNome seguradoId={a.seguradoId} />
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-0.5 text-xs shrink-0">
                        <span className="font-semibold text-(--fg)">
                          {formatarMoeda(a.valorSeguro)}
                        </span>
                        <span className="text-(--muted)">
                          Vigência: {formatarData(a.dataFimVigencia)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <span className="text-xs text-(--danger) mt-1 block">{error}</span>
      )}
    </div>
  );
};

