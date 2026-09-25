import React, { useState } from "react";
import {
  Button,
  FormErrorBanner,
  Input,
  Modal,
  Select,
} from "../../../components/ui";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";
import { extrairMensagemErro } from "../../../utils/errorUtils";
import { formatarMoeda } from "../../../utils/formatters";
import { useApolicePorId } from "../../apolices/hooks/useApolices";

export type TipoAcaoSinistro = "aprovar" | "rejeitar";

export interface AprovarRejeitarModalProps {
  isOpen: boolean;
  onClose: () => void;
  sinistro: Sinistro | null;
  acao: TipoAcaoSinistro | null;
  onConfirmAprovar: (valorAprovado: number) => Promise<void> | void;
  onConfirmRejeitar: (motivoRejeicao: string) => Promise<void> | void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

const MOTIVOS_REJEICAO_PADRAO = [
  {
    value: "Cobertura não contempla o evento",
    label: "Cobertura não contempla o evento",
  },
  {
    value: "Ausência de documentos obrigatórios",
    label: "Ausência de documentos obrigatórios",
  },
  {
    value: "Divergência documental do segurado",
    label: "Divergência documental do segurado",
  },
  {
    value: "Ocorrência fora da vigência da apólice",
    label: "Ocorrência fora da vigência da apólice",
  },
  { value: "Suspeita de fraude", label: "Suspeita de fraude" },
  { value: "OUTRO", label: "Outro motivo (descrever manualmente)" },
];

export const AprovarRejeitarModal: React.FC<AprovarRejeitarModalProps> = ({
  isOpen,
  onClose,
  sinistro,
  acao,
  onConfirmAprovar,
  onConfirmRejeitar,
  isLoading = false,
  errorMessage = null,
}) => {
  const isAprovar = acao === "aprovar";

  const [prevSinistroId, setPrevSinistroId] = useState<string | null>(null);
  const [valorAprovado, setValorAprovado] = useState<string>("");
  const [motivoSelect, setMotivoSelect] = useState<string>(
    MOTIVOS_REJEICAO_PADRAO[0].value,
  );
  const [motivoOutro, setMotivoOutro] = useState<string>("");
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  const { data: apolice, isLoading: isLoadingApolice } = useApolicePorId(
    isAprovar && isOpen ? sinistro?.apoliceId : undefined,
  );

  if (sinistro && isOpen && sinistro.id !== prevSinistroId) {
    setPrevSinistroId(sinistro.id || null);
    setValorAprovado(String(sinistro.valorEstimado || ""));
    setMotivoSelect(MOTIVOS_REJEICAO_PADRAO[0].value);
    setMotivoOutro("");
    setErroLocal(null);
  }

  if (!sinistro || !acao) return null;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErroLocal(null);

    if (isAprovar) {
      const valor = Number(valorAprovado);
      if (isNaN(valor) || valor <= 0) {
        setErroLocal("Informe um valor aprovado válido maior que zero.");
        return;
      }
      if (apolice?.valorSeguro != null && valor > apolice.valorSeguro) {
        setErroLocal(
          `O valor aprovado (${formatarMoeda(valor)}) não pode exceder o limite segurado da apólice (${formatarMoeda(apolice.valorSeguro)}).`,
        );
        return;
      }
      try {
        await onConfirmAprovar(valor);
      } catch (err) {
        setErroLocal(extrairMensagemErro(err, "Falha ao aprovar o sinistro."));
      }
    } else {
      const motivoFinal =
        motivoSelect === "OUTRO" ? motivoOutro.trim() : motivoSelect;
      if (!motivoFinal) {
        setErroLocal("Informe o motivo da rejeição.");
        return;
      }
      try {
        await onConfirmRejeitar(motivoFinal);
      } catch (err) {
        setErroLocal(extrairMensagemErro(err, "Falha ao rejeitar o sinistro."));
      }
    }
  };

  const valorNumerico = Number(valorAprovado);
  const ultrapassaLimite =
    isAprovar &&
    apolice?.valorSeguro != null &&
    !isNaN(valorNumerico) &&
    valorNumerico > apolice.valorSeguro;

  const mensagemExibicao = errorMessage
    ? extrairMensagemErro(errorMessage)
    : erroLocal;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAprovar ? "Aprovar e Liquidar Sinistro" : "Rejeitar Sinistro"}
      description={
        isAprovar
          ? `Sinistro ${sinistro.numeroSinistro}`
          : `Confirme a recusa do Sinistro ${sinistro.numeroSinistro}. Esta ação é definitiva.`
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormErrorBanner message={mensagemExibicao} />

        {/* Lembrete de Regras de Domínio */}
        <div className="p-3 rounded-lg bg-(--surface-2)/60 border border-(--border) text-xs flex items-start gap-2">
          <svg
            className="w-4 h-4 shrink-0 mt-0.5 text-(--accent-ink)"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-(--muted)">
            <strong className="text-(--fg)">Regras de Domínio:</strong>{" "}
            {isAprovar
              ? "A aprovação exige documentos comprobatórios recebidos no sistema e o valor aprovado não pode exceder o valor segurado da apólice."
              : "A rejeição encerra o processo do sinistro e deve conter motivo fundamentado registrado."}
          </div>
        </div>

        {isAprovar && (
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-(--surface-2)/40 border border-(--border) text-xs">
            <div>
              <span className="text-(--muted) block">Valor Estimado:</span>
              <span className="font-semibold text-(--fg) text-sm">
                {formatarMoeda(sinistro.valorEstimado)}
              </span>
            </div>
            <div>
              <span className="text-(--muted) block">
                Limite Segurado da Apólice:
              </span>
              <span className="font-semibold text-(--accent-ink) text-sm">
                {isLoadingApolice
                  ? "Carregando apólice..."
                  : apolice?.valorSeguro != null
                    ? formatarMoeda(apolice.valorSeguro)
                    : "Não disponível"}
              </span>
            </div>
          </div>
        )}

        {isAprovar ? (
          <div className="space-y-3">
            <Input
              label="Valor Aprovado para Indenização (R$) *"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={valorAprovado}
              onChange={(e) => setValorAprovado(e.target.value)}
              placeholder="0.00"
            />
            {ultrapassaLimite && (
              <p className="text-xs font-semibold text-(--danger) flex items-center gap-1">
                <span>
                  Atenção: O valor excede o limite segurado da apólice (
                  {formatarMoeda(apolice!.valorSeguro)}).
                </span>
              </p>
            )}
            <p className="text-xs text-(--muted)">
              Regra de negócio: o valor aprovado não pode exceder o limite
              segurado da apólice. Ao confirmar, o sinistro mudará para{" "}
              <strong>APROVADO</strong> e será enviado para liquidação.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Select
              label="Motivo da Rejeição *"
              value={motivoSelect}
              onChange={(e) => setMotivoSelect(e.target.value)}
              options={MOTIVOS_REJEICAO_PADRAO}
            />

            {motivoSelect === "OUTRO" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-(--muted) uppercase tracking-wider">
                  Descreva o Motivo *
                </label>
                <textarea
                  className="w-full px-3 py-2 text-sm rounded-lg border border-(--border-strong) bg-(--surface) focus:outline-none focus:border-(--accent) text-(--fg)"
                  rows={3}
                  required
                  value={motivoOutro}
                  onChange={(e) => setMotivoOutro(e.target.value)}
                  placeholder="Informe o motivo da recusa..."
                />
              </div>
            )}
            <p className="text-xs text-(--danger)">
              Ao confirmar a rejeição, o status mudará para REJEITADO e o
              processo será encerrado.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-(--border)">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant={isAprovar ? "primary" : "danger"}
            type="submit"
            isLoading={isLoading}
          >
            {isAprovar ? "Confirmar Aprovação" : "Confirmar Rejeição"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
