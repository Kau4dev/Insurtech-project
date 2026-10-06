import React, { useEffect, useRef, useState } from "react";
import { Badge,SearchInput } from "../../../components/ui";
import { getPessoaTipoBadgeVariant } from "../../../utils/enumUtils";
import { apenasNumeros, formatarCpfCnpj } from "../../../utils/formatters";
import { useSeguradoPorId, useSegurados } from "../hooks/useSegurados";

export interface SeguradoSelectFilterProps {
  value?: string;
  onChange: (seguradoId: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}

export const SeguradoSelectFilter: React.FC<SeguradoSelectFilterProps> = ({
  value,
  onChange,
  disabled = false,
  error,
  label = "Segurado",
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

  // Carrega segurados (da busca ou padrão)
  const { data: seguradosData, isLoading } = useSegurados({
    nome: debouncedTermo.trim() || undefined,
    size: 10,
  });

  const segurados = seguradosData?.content || [];

  // Busca segurado individual se não estiver na listagem carregada
  const { data: seguradoIndividual } = useSeguradoPorId(
    value && !segurados.some((s) => s.id === value) ? value : undefined,
  );

  const seguradoSelecionado =
    value && value.trim().length > 0
      ? segurados.find((s) => s.id === value) || seguradoIndividual
      : undefined;

  // Filtro local instantâneo (nome ou CPF/CNPJ com/sem pontuação)
  const digitos = apenasNumeros(termo);
  const termoLower = termo.toLowerCase().trim();

  const seguradosExibidos = segurados.filter((s) => {
    if (!termoLower) return true;
    const matchNome = s.nomeRazaoSocial.toLowerCase().includes(termoLower);
    const matchCpfCnpj = digitos.length > 0 && s.cpfCnpj.includes(digitos);
    const matchFormatado = formatarCpfCnpj(s.cpfCnpj, s.tipoPessoa).includes(
      termoLower,
    );
    return matchNome || matchCpfCnpj || matchFormatado;
  });

  const handleSelect = (id: string) => {
    onChange(id);
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

      {/* Segurado já selecionado */}
      {seguradoSelecionado?.id && !isOpen ? (
        <div
          className={`p-3 rounded-lg border bg-(--surface-2)/60 text-xs flex items-center justify-between gap-3 ${
            error ? "border-(--danger)" : "border-(--border)"
          } ${disabled ? "opacity-80" : ""}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Badge
              variant={getPessoaTipoBadgeVariant(
                seguradoSelecionado.tipoPessoa,
              )}
            >
              {seguradoSelecionado.tipoPessoa}
            </Badge>
            <span className="font-semibold text-sm text-(--fg) truncate">
              {seguradoSelecionado.nomeRazaoSocial}
            </span>
            <span className="text-(--muted)">•</span>
            <span className="mono text-xs text-(--muted) shrink-0">
              {seguradoSelecionado.tipoPessoa === "PF" ? "CPF: " : "CNPJ: "}
              {formatarCpfCnpj(
                seguradoSelecionado.cpfCnpj,
                seguradoSelecionado.tipoPessoa,
              )}
            </span>
          </div>
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
            placeholder="Digite nome, CPF ou CNPJ para buscar..."
            disabled={disabled}
            className={error ? "border-(--danger)" : ""}
          />

          {isOpen && !disabled && (
            <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-(--surface) border border-(--border) rounded-lg shadow-xl divide-y divide-(--border)/40">
              {isLoading ? (
                <div className="p-3 text-xs text-(--muted) text-center">
                  Buscando segurados...
                </div>
              ) : seguradosExibidos.length === 0 ? (
                <div className="p-3 text-xs text-(--muted) text-center">
                  Nenhum segurado encontrado{termo ? ` para "${termo}"` : ""}.
                </div>
              ) : (
                seguradosExibidos.map((s) => {
                  const isCurrent = s.id === value;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelect(s.id || "")}
                      className={`w-full text-left px-3 py-2.5 hover:bg-(--surface-2) transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                        isCurrent ? "bg-(--accent)/10 font-medium" : ""
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getPessoaTipoBadgeVariant(s.tipoPessoa)}
                          >
                            {s.tipoPessoa}
                          </Badge>
                          <span className="font-medium text-sm text-(--fg) truncate">
                            {s.nomeRazaoSocial}
                          </span>
                        </div>
                        <span className="mono text-xs text-(--muted)">
                          {s.tipoPessoa === "PF" ? "CPF: " : "CNPJ: "}
                          {formatarCpfCnpj(s.cpfCnpj, s.tipoPessoa)}
                        </span>
                      </div>
                      {s.enderecoCidade && (
                        <span className="text-xs text-(--muted) shrink-0">
                          {s.enderecoCidade}
                          {s.enderecoUf ? `/${s.enderecoUf}` : ""}
                        </span>
                      )}
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
