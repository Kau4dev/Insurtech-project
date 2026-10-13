import React, { useState } from "react";
import { Modal, Button } from "../../../components/ui";

interface CredenciaisModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  senhaTemporaria: string;
  nomeRazaoSocial: string;
}

export const CredenciaisModal: React.FC<CredenciaisModalProps> = ({
  isOpen,
  onClose,
  email,
  senhaTemporaria,
  nomeRazaoSocial,
}) => {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = async () => {
    const texto = `Olá ${nomeRazaoSocial},\n\nSeu acesso ao Portal do Segurado InsurTech foi criado!\n\nEmail: ${email}\nSenha: ${senhaTemporaria}\n\nAcesse em: ${window.location.origin}/portal/login`;
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);

  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Acesso Criado com Sucesso! 🎉"
      description="O segurado foi provisionado no sistema. Copie as credenciais abaixo para repassar ao cliente."
      maxWidthClass="max-w-md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-(--surface-2) border border-(--border) space-y-3">
          <div>
            <span className="text-xs text-(--muted) uppercase font-mono">E-mail de Acesso</span>
            <p className="font-medium text-(--fg) select-all">{email}</p>
          </div>
          <div>
            <span className="text-xs text-(--muted) uppercase font-mono">Senha Temporária</span>
            <div className="flex items-center gap-2 mt-1">
              <code className="px-3 py-1.5 rounded bg-(--surface) border border-(--border) font-mono text-base font-bold text-(--accent) select-all">
                {senhaTemporaria}
              </code>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
          <strong>Atenção:</strong> Por motivos de segurança, esta senha foi criptografada e <strong>não poderá ser visualizada novamente</strong> após fechar esta janela.
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleCopiar}>
            {copiado ? "✓ Copiado com Sucesso!" : "📋 Copiar Dados de Acesso"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
