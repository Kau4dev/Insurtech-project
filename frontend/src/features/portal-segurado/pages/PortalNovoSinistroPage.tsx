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
      <div className="py-20 text-center space-y-3">
        <div className="animate-spin w-8 h-8 border-2 border-(--accent) border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-(--muted) font-medium">
          Carregando informações do segurado...
        </p>
      </div>
    );
  }

  if (!segurado?.id) {
    return (
      <div className="p-8 rounded-(--radius) bg-red-500/5 border border-red-500/20 text-center space-y-3 max-w-lg mx-auto">
        <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-base font-bold text-(--fg)">
          Perfil de Segurado não localizado
        </h2>
        <p className="text-xs text-(--muted) leading-relaxed">
          Não foi possível identificar o titular do cadastro para abertura de
          sinistro.
        </p>
        <Link to="/portal">
          <Button variant="secondary" size="sm">
            Voltar ao Portal
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header com breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-xs text-(--muted) mb-1">
          <Link
            to="/portal"
            className="hover:text-(--fg) hover:underline transition-colors flex items-center gap-1"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>Portal</span>
          </Link>
          <span>/</span>
          <span className="text-(--fg) font-medium">Novo Sinistro</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-(--fg)">
          Acionar Seguro / Novo Sinistro
        </h1>
        <p className="text-xs text-(--muted) mt-0.5">
          Siga as etapas abaixo para registrar a ocorrência com precisão e
          agilidade.
        </p>
      </div>

      {/* Card do Wizard */}
      <div className="p-5 sm:p-7 rounded-(--radius) bg-(--surface) border border-(--border) shadow-xs">
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
