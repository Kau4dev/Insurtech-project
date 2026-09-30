import React, { useEffect, useMemo, useState } from "react";
import { Button, FormErrorBanner, Modal, Select } from "../../../components/ui";
import { useAuth } from "../../../context/useAuth";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";
import { formatarPapelUsuario, formatarTipoSinistro } from "../../../utils/enumUtils";
import { extrairMensagemErro } from "../../../utils/errorUtils";
import { formatarData, formatarMoeda } from "../../../utils/formatters";
import { ApoliceNumero } from "../../apolices/components/ApoliceNumero";
import { useUsuarios } from "../../auth/hooks/useUsuarios";
import { SeguradoNome } from "../../segurados/components/SeguradoNome";

export interface AtribuirAnalistaModalProps {
  isOpen: boolean;
  onClose: () => void;
  sinistro: Sinistro | null;
  onConfirm: (analistaId: string) => Promise<void> | void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const AtribuirAnalistaModal: React.FC<AtribuirAnalistaModalProps> = ({
  isOpen,
  onClose,
  sinistro,
  onConfirm,
  isLoading = false,
  errorMessage = null,
}) => {
  const { usuario } = useAuth();
  const isAnalista = usuario?.papel === "ANALISTA";

  const { data: usuarios = [], isLoading: isLoadingUsuarios } = useUsuarios();

  const analistas = useMemo(() => {
    return usuarios.filter(
      (u) => u.papel === "ANALISTA" || u.papel === "GESTOR",
    );
  }, [usuarios]);

  const analistaOptions = useMemo(() => {
    return analistas.map((u) => ({
      value: u.id,
      label: `${u.nome} (${formatarPapelUsuario(u.papel)}) - ${u.email}`,
    }));
  }, [analistas]);

  // Se for gestor/admin, inicia com o próprio ID ou analista atual do sinistro
  const [analistaIdInput, setAnalistaIdInput] = useState<string>(() => {
    return sinistro?.analistaId || usuario?.id || "";
  });
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErroLocal(null);
      if (isAnalista) {
        setAnalistaIdInput(usuario?.id || "");
      } else {
        setAnalistaIdInput(sinistro?.analistaId || usuario?.id || "");
      }
    }
  }, [isOpen, sinistro?.analistaId, usuario?.id, isAnalista]);

  if (!sinistro) return null;

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroLocal(null);

    const targetId = isAnalista ? usuario?.id : analistaIdInput.trim();

    if (!targetId) {
      setErroLocal("Selecione o analista responsável.");
      return;
    }

    if (!UUID_REGEX.test(targetId)) {
      setErroLocal(
        "O identificador do analista deve ser um UUID válido.",
      );
      return;
    }

    try {
      await onConfirm(targetId);
    } catch (err) {
      setErroLocal(extrairMensagemErro(err, "Falha ao atribuir analista."));
    }
  };

  const mensagemErroFormatada = errorMessage
    ? extrairMensagemErro(errorMessage)
    : erroLocal;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isAnalista
          ? "Assumir Análise do Sinistro"
          : "Atribuir Analista Responsável"
      }
      description={
        isAnalista
          ? "Como analista, assuma o processo para iniciar a verificação de documentos e coberturas."
          : "Como gestor ou administrador, defina o analista responsável pela condução deste sinistro."
      }
      maxWidthClass="max-w-xl"
    >
      <form onSubmit={handleConfirmar} className="space-y-5">
        <FormErrorBanner message={mensagemErroFormatada} />

        {/* Resumo do Sinistro */}
        <div className="p-3.5 rounded-lg bg-(--surface-2)/60 border border-(--border) text-xs space-y-2">
          <div className="flex items-center justify-between font-medium">
            <span className="text-(--muted)">Número:</span>
            <span className="font-semibold text-(--fg) text-sm">
              {sinistro.numeroSinistro}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-(--muted)">Tipo do Evento:</span>
            <span className="text-(--fg)">
              {formatarTipoSinistro(sinistro.tipoSinistro)}
            </span>
          </div>

          {sinistro.apoliceId && (
            <div className="flex items-center justify-between">
              <span className="text-(--muted)">Apólice:</span>
              <span className="text-(--fg)">
                <ApoliceNumero apoliceId={sinistro.apoliceId} />
              </span>
            </div>
          )}

          {sinistro.seguradoId && (
            <div className="flex items-center justify-between">
              <span className="text-(--muted)">Segurado:</span>
              <span className="text-(--fg)">
                <SeguradoNome seguradoId={sinistro.seguradoId} />
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-(--muted)">Ocorrência:</span>
            <span className="text-(--fg)">
              {formatarData(sinistro.dataOcorrencia)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-(--border)">
            <span className="text-(--muted)">Valor Estimado:</span>
            <span className="font-semibold text-(--fg)">
              {formatarMoeda(sinistro.valorEstimado)}
            </span>
          </div>
        </div>

        {/* Bloco de Atribuição de acordo com o Papel */}
        {isAnalista ? (
          <div className="p-3.5 rounded-lg bg-(--surface-2)/40 border border-(--accent-border) text-xs space-y-2">
            <div className="font-semibold text-(--accent-ink) flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Você assumirá a responsabilidade deste sinistro</span>
            </div>
            <p className="text-(--muted)">
              Ao confirmar, o status deste sinistro mudará automaticamente de{" "}
              <strong className="text-(--fg)">REGISTRADO</strong> para{" "}
              <strong className="text-blue-600">EM ANÁLISE</strong> e ficará sob
              sua responsabilidade direta para solicitação de documentos,
              aprovação ou rejeição.
            </p>
            <div className="text-xs pt-1 font-medium text-(--fg)">
              Analista: <strong>{usuario?.nome}</strong> ({usuario?.email})
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Select
              label="Analista Responsável *"
              name="analistaId"
              value={analistaIdInput}
              onChange={(e) => setAnalistaIdInput(e.target.value)}
              options={analistaOptions}
              placeholder={
                isLoadingUsuarios
                  ? "Carregando usuários..."
                  : "-- Selecione um analista responsável --"
              }
              disabled={isLoading || isLoadingUsuarios}
              required
            />

            {usuario?.id &&
              (usuario.papel === "ANALISTA" || usuario.papel === "GESTOR") && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-(--muted)">
                    Conectado como: <strong>{usuario.nome}</strong> (
                    {formatarPapelUsuario(usuario.papel)})
                  </span>
                  <button
                    type="button"
                    onClick={() => setAnalistaIdInput(usuario.id)}
                    className="text-(--accent-ink) hover:underline font-medium cursor-pointer"
                  >
                    Atribuir a mim mesmo
                  </button>
                </div>
              )}

            <p className="text-xs text-(--muted)">
              Regra de negócio: o analista selecionado deve ser um usuário ativo
              com perfil <strong>Analista</strong> ou <strong>Gestor</strong>. Ao
              atribuir, o sinistro mudará para <strong>EM ANÁLISE</strong>.
            </p>
          </div>
        )}

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-(--border)">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>

          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading
              ? "Atribuindo..."
              : isAnalista
                ? "Confirmar e Assumir"
                : "Atribuir Analista"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
