import React, { useState } from "react";
import { Badge, Button, Modal } from "../../../components/ui";

interface UsuarioCredenciaisModalProps {
  isOpen: boolean;
  onClose: () => void;
  nome: string;
  email: string;
  papel: string;
  senhaPlana: string;
}

const papelBadgeVariant: Record<
  string,
  "purple" | "info" | "success" | "neutral"
> = {
  ADMIN: "purple",
  GESTOR: "info",
  ANALISTA: "success",
};

const papelLabel: Record<string, string> = {
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  ANALISTA: "Analista",
};

export const UsuarioCredenciaisModal: React.FC<
  UsuarioCredenciaisModalProps
> = ({ isOpen, onClose, nome, email, papel, senhaPlana }) => {
  const [copiadoGeral, setCopiadoGeral] = useState(false);
  const [copiadoCampo, setCopiadoCampo] = useState<"email" | "senha" | null>(
    null,
  );
  const [mostrarSenha, setMostrarSenha] = useState(true);

  const handleCopiarTudo = async () => {
    const cargoFormatado = papelLabel[papel] || papel;
    const texto = `Acesso Corporativo - Plataforma InsurTech\n\nColaborador: ${nome}\nPerfil: ${cargoFormatado} (${papel})\nE-mail: ${email}\nSenha: ${senhaPlana}\nURL de acesso: ${window.location.origin}/login`;
    await navigator.clipboard.writeText(texto);
    setCopiadoGeral(true);
    setTimeout(() => setCopiadoGeral(false), 3000);
  };

  const handleCopiarIndividual = async (
    tipo: "email" | "senha",
    valor: string,
  ) => {
    await navigator.clipboard.writeText(valor);
    setCopiadoCampo(tipo);
    setTimeout(() => setCopiadoCampo(null), 2000);
  };

  const iniciais =
    nome
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "US";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Usuário Criado com Sucesso"
      description="As credenciais corporativas foram geradas e o acesso está ativo para uso imediato."
      maxWidthClass="max-w-md"
    >
      <div className="space-y-4">
        {/* Card do Usuário */}
        <div className="p-3 rounded-(--radius) bg-(--surface-2)/60 border border-(--border) flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-(--surface) border border-(--border) text-(--accent-ink) font-semibold flex items-center justify-center text-xs shrink-0 select-none">
              {iniciais}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-(--muted) font-medium">
                Usuário interno
              </p>
              <p className="text-sm font-semibold text-(--fg) truncate">
                {nome}
              </p>
            </div>
          </div>
          <Badge
            variant={papelBadgeVariant[papel] || "neutral"}
            className="shrink-0 text-[10.5px] uppercase font-mono"
          >
            {papelLabel[papel] || papel}
          </Badge>
        </div>

        {/* Bloco de Credenciais Estruturado */}
        <div className="rounded-(--radius) bg-(--surface) border border-(--border) divide-y divide-(--border) shadow-2xs overflow-hidden">
          {/* Linha 1: E-mail */}
          <div className="p-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-(--muted) font-medium block">
                E-mail de Acesso
              </span>
              <p className="font-mono text-xs sm:text-[13px] text-(--fg) font-medium truncate select-all mt-0.5">
                {email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopiarIndividual("email", email)}
              className="p-1.5 rounded-md hover:bg-(--surface-2) text-(--muted) hover:text-(--fg) transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1 text-[11px]"
              title="Copiar e-mail"
              aria-label="Copiar e-mail"
            >
              {copiadoCampo === "email" ? (
                <>
                  <svg
                    className="w-3.5 h-3.5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-emerald-700 font-medium">Copiado</span>
                </>
              ) : (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>

          {/* Linha 2: Senha */}
          <div className="p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-(--muted) font-medium">
                Senha Provisória
              </span>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-(--accent-soft) text-(--accent-ink) border border-(--accent)/20">
                Exibição Única
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-(--surface-2) border border-(--border)">
              <code className="font-mono text-sm sm:text-base font-bold text-(--accent-ink) tracking-wider select-all truncate">
                {mostrarSenha ? senhaPlana : "••••••••••••"}
              </code>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setMostrarSenha((prev) => !prev)}
                  className="p-1 rounded text-(--muted) hover:text-(--fg) hover:bg-(--surface) transition-colors cursor-pointer"
                  title={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
                >
                  {mostrarSenha ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleCopiarIndividual("senha", senhaPlana)}
                  className="p-1 rounded text-(--muted) hover:text-(--fg) hover:bg-(--surface) transition-colors cursor-pointer"
                  title="Copiar apenas a senha"
                  aria-label="Copiar apenas a senha"
                >
                  {copiadoCampo === "senha" ? (
                    <svg
                      className="w-4 h-4 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Aviso de Segurança Institucional */}
        <div className="flex items-start gap-2.5 p-3 rounded-(--radius) bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 leading-relaxed">
          <svg
            className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <strong className="font-semibold text-amber-900">
              Aviso de segurança:
            </strong>{" "}
            Esta credencial corporativa é protegida com hash criptográfico
            irreversível (BCrypt) e{" "}
            <strong>não poderá ser visualizada novamente</strong> após fechar
            esta janela.
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-(--border)">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          <Button
            variant="primary"
            onClick={handleCopiarTudo}
            icon={
              copiadoGeral ? (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )
            }
          >
            {copiadoGeral ? "Copiado com Sucesso!" : "Copiar Dados de Acesso"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

