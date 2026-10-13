import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMeuPerfilSegurado } from "../hooks/useMeuPerfilSegurado";
import { AbrirSinistroWizard } from "../components/AbrirSinistroWizard";
import { Button } from "../../../components/ui";

export const PortalNovoSinistroPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const apoliceId = searchParams.get("apoliceId") || undefined;

  const { data: segurado, isLoading: loadingSegurado } = useMeuPerfilSegurado();

  const handleSuccess = (novoSinistroId: string) => {
    navigate(`/portal/sinistros/${novoSinistroId}`);
  };

  const handleCancel = () => {
    navigate("/portal");
  };

  if (loadingSegurado) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="animate-spin w-8 h-8 border-2 border-(--accent) border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-(--muted)">Carregando informações do segurado...</p>
      </div>
    );
  }

  if (!segurado?.id) {
    return (
      <div className="p-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
        <h2 className="text-lg font-bold text-rose-700 dark:text-rose-400">
          Perfil de Segurado não localizado
        </h2>
        <p className="text-sm text-(--muted)">
          Não foi possível identificar o titular do cadastro para abertura de sinistro.
        </p>
        <Link to="/portal">
          <Button variant="secondary">Voltar ao Portal</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header com breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-xs text-(--muted) mb-1">
          <Link to="/portal" className="hover:underline">
            Portal
          </Link>
          <span>/</span>
          <span className="text-(--fg)">Novo Sinistro</span>
        </div>
        <h1 className="text-2xl font-bold text-(--fg)">Acionar Seguro / Novo Sinistro</h1>
        <p className="text-xs text-(--muted) mt-0.5">
          Siga as etapas abaixo para registrar a ocorrência com precisão e agilidade.
        </p>
      </div>

      {/* Card do Wizard */}
      <div className="p-6 rounded-2xl bg-(--surface) border border-(--border)">
        <AbrirSinistroWizard
          seguradoId={segurado.id}
          apoliceInicialId={apoliceId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

