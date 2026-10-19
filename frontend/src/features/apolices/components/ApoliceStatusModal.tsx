import React, { useMemo, useState } from "react";
import { Button, FormErrorBanner, Modal, Select } from "../../../components/ui";
import type { StatusApolice } from "../../../interfaces/enums";
import { formatarStatusApolice } from "../../../utils/enumUtils";

interface ApoliceStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusAtual?: StatusApolice;
  onConfirm: (novoStatus: StatusApolice) => Promise<void> | void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const ApoliceStatusModal: React.FC<ApoliceStatusModalProps> = ({
  isOpen,
  onClose,
  statusAtual = "ATIVA",
  onConfirm,
  isLoading = false,
  errorMessage = null,
}) => {
  // Transições manuais válidas de acordo com as regras de negócio
  const opcoesDisponiveis = useMemo(() => {
    if (statusAtual === "ATIVA") {
      return [
        { value: "SUSPENSA", label: "Suspensa" },
        { value: "CANCELADA", label: "Cancelada" },
      ];
    }
    if (statusAtual === "SUSPENSA") {
      return [
        { value: "ATIVA", label: "Ativa (Reativar)" },
        { value: "CANCELADA", label: "Cancelada" },
      ];
    }
    // Status terminal (CANCELADA ou EXPIRADA)
    return [];
  }, [statusAtual]);

  const statusInicial = opcoesDisponiveis[0]?.value as StatusApolice | undefined;
  const [prevStatus, setPrevStatus] = useState<StatusApolice>(statusAtual);
  const [novoStatus, setNovoStatus] = useState<StatusApolice | "">(
    statusInicial || "",
  );

  if (statusAtual !== prevStatus) {
    setPrevStatus(statusAtual);
    setNovoStatus(statusInicial || "");
  }

  const isStatusTerminal =
    statusAtual === "CANCELADA" || statusAtual === "EXPIRADA";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoStatus || isStatusTerminal) return;
    await onConfirm(novoStatus as StatusApolice);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Alterar Status da Apólice"
      description={`Status atual: ${formatarStatusApolice(statusAtual)}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormErrorBanner message={errorMessage} />

        {isStatusTerminal ? (
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
            <svg
              className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              Apólices com status{" "}
              <strong>{formatarStatusApolice(statusAtual)}</strong> estão em
              estado final e não podem ser alteradas manualmente.
            </span>
          </div>
        ) : (
          <Select
            label="Novo Status *"
            value={novoStatus}
            onChange={(e) => setNovoStatus(e.target.value as StatusApolice)}
            options={opcoesDisponiveis}
          />
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-(--border)">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            {isStatusTerminal ? "Fechar" : "Cancelar"}
          </Button>
          {!isStatusTerminal && (
            <Button
              variant="primary"
              type="submit"
              isLoading={isLoading}
              disabled={!novoStatus}
            >
              Atualizar Status
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

