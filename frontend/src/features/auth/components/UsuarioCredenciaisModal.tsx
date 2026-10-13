import React, { useState } from "react";
import { Button, Modal } from "../../../components/ui";

interface UsuarioCredenciaisModalProps {
  isOpen: boolean;
  onClose: () => void;
  nome: string;
  email: string;
  papel: string;
  senhaPlana: string;
}

export const UsuarioCredenciaisModal: React.FC<UsuarioCredenciaisModalProps> = ({
  isOpen,
  onClose,
  nome,
  email,
  papel,
  senhaPlana,
}) => {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = async () => {
    const texto = `Olá ${nome},\n\nSeu acesso à plataforma InsurTech (${papel}) foi criado!\n\nEmail: ${email}\nSenha: ${senhaPlana}\n\nAcesse em: ${window.location.origin}/login`;
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Usuário Criado com Sucesso! 🎉"
      description="As credenciais corporativas foram geradas e o acesso está ativo."
      maxWidthClass="max-w-md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-(--surface-2) border border-(--border) space-y-3">
          <div>
            <span className="text-xs text-(--muted) uppercase font-mono">
              Nome
            </span>
            <p className="font-medium text-(--fg)">{nome}</p>
          </div>
          <div>
            <span className="text-xs text-(--muted) uppercase font-mono">
              E-mail de Acesso
            </span>
            <p className="font-medium text-(--fg) select-all">{email}</p>
          </div>
          <div>
            <span className="text-xs text-(--muted) uppercase font-mono">
              Perfil / Papel
            </span>
            <p className="font-mono text-sm font-semibold text-(--accent-ink)">
              {papel}
            </p>
          </div>
          <div>
            <span className="text-xs text-(--muted) uppercase font-mono">
              Senha Definida
            </span>
            <div className="flex items-center gap-2 mt-1">
              <code className="px-3 py-1.5 rounded bg-(--surface) border border-(--border) font-mono text-base font-bold text-(--accent) select-all">
                {senhaPlana}
              </code>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
          <strong>Atenção:</strong> Por motivos de segurança, a senha é armazenada com hash criptográfico irreversível e <strong>não poderá ser visualizada novamente</strong> após fechar esta janela.
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

