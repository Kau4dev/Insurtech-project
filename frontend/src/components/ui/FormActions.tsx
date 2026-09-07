import React from "react";
import { Button } from "./Button";

interface FormActionsProps {
  onCancel: () => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
  isEdicao?: boolean;
  submitText?: string;
  cancelText?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  isLoading = false,
  isSubmitting = false,
  isEdicao = false,
  submitText,
  cancelText = "Cancelar",
}) => {
  const disabled = isLoading || isSubmitting;
  const defaultSubmitText = isEdicao ? "Salvar Alterações" : "Cadastrar";

  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-(--border)">
      <Button
        variant="ghost"
        type="button"
        onClick={onCancel}
        disabled={disabled}
      >
        {cancelText}
      </Button>
      <Button variant="primary" type="submit" isLoading={disabled}>
        {submitText || defaultSubmitText}
      </Button>
    </div>
  );
};
