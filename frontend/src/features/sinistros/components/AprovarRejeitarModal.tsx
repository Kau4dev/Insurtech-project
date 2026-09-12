import React, { useState } from "react";
import {
  Button,
  FormErrorBanner,
  Input,
  Modal,
  Select,
} from "../../../components/ui";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";
import { formatarMoeda } from "../../../utils/formatters";

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

  if (sinistro && isOpen && sinistro.id !== prevSinistroId) {
    setPrevSinistroId(sinistro.id || null);
    setValorAprovado(String(sinistro.valorEstimado || ""));
    setMotivoSelect(MOTIVOS_REJEICAO_PADRAO[0].value);
    setMotivoOutro("");
  }

  if (!sinistro || !acao) return null;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isAprovar) {
      const valor = Number(valorAprovado);
      if (isNaN(valor) || valor <= 0) return;
      await onConfirmAprovar(valor);
    } else {
      const motivoFinal =
        motivoSelect === "OUTRO" ? motivoOutro.trim() : motivoSelect;
      if (!motivoFinal) return;
      await onConfirmRejeitar(motivoFinal);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAprovar ? "Aprovar e Liquidar Sinistro" : "Rejeitar Sinistro"}
      description={
        isAprovar
          ? `Sinistro ${sinistro.numeroSinistro} · Valor estimado: ${formatarMoeda(sinistro.valorEstimado)}`
          : `Confirme a recusa do Sinistro ${sinistro.numeroSinistro}. Esta ação é definitiva.`
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormErrorBanner message={errorMessage} />

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
            <p className="text-xs text-(--muted)">
              Regra de negócio: o valor aprovado não pode exceder o valor
              segurado da apólice.
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
