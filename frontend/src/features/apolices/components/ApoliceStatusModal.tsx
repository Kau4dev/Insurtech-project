import React, { useEffect, useState } from "react";
import { Button, FormErrorBanner, Modal, Select } from "../../../components/ui";
import type { StatusApolice } from "../../../interfaces/enums";

interface ApoliceStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusAtual?: StatusApolice;
  onConfirm: (novoStatus: StatusApolice) => Promise<void> | void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

const OPCOES_STATUS: { value: StatusApolice; label: string }[] = [
  { value: "ATIVA", label: "Ativa" },
  { value: "SUSPENSA", label: "Suspensa" },
  { value: "CANCELADA", label: "Cancelada" },
  { value: "EXPIRADA", label: "Expirada" },
];

export const ApoliceStatusModal: React.FC<ApoliceStatusModalProps> = ({
  isOpen,
  onClose,
  statusAtual = "ATIVA",
  onConfirm,
  isLoading = false,
  errorMessage = null,
}) => {
  const [novoStatus, setNovoStatus] = useState<StatusApolice>(statusAtual);

  useEffect(() => {
    if (statusAtual) {
      setNovoStatus(statusAtual);
    }
  }, [statusAtual]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(novoStatus);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Alterar Status da Apólice"
      description="Selecione o novo status para atualizar a apólice."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormErrorBanner message={errorMessage} />

        <Select
          label="Novo Status *"
          value={novoStatus}
          onChange={(e) => setNovoStatus(e.target.value as StatusApolice)}
          options={OPCOES_STATUS}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-(--border)">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Atualizar Status
          </Button>
        </div>
      </form>
    </Modal>
  );
};
