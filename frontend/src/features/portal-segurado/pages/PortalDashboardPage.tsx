import React from "react";
import { Link } from "react-router-dom";
import { useMeuPerfilSegurado } from "../hooks/useMeuPerfilSegurado";
import { useMinhasApolices } from "../hooks/useMinhasApolices";
import { useMeusSinistros } from "../hooks/useMeusSinistros";
import { MinhasApolicesCard } from "../components/MinhasApolicesCard";
import { Badge, Button } from "../../../components/ui";
import { formatarData, formatarMoeda } from "../../../utils/formatters";
import {
  formatarStatusSinistro,
  formatarTipoSinistro,
  getSinistroStatusBadgeVariant,
} from "../../../utils/enumUtils";

export const PortalDashboardPage: React.FC = () => {
  const { data: segurado, isLoading: loadingSegurado, isError: erroSegurado } =
    useMeuPerfilSegurado();

  const seguradoId = segurado?.id || "";

  const { data: apolicesPage, isLoading: loadingApolices } =
    useMinhasApolices(seguradoId);
  const { data: sinistrosPage, isLoading: loadingSinistros } =
    useMeusSinistros(seguradoId);

  if (loadingSegurado) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="animate-spin w-8 h-8 border-2 border-(--accent) border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-(--muted)">Carregando informações do segurado...</p>
      </div>
    );
  }

  if (erroSegurado || !segurado) {
    return (
      <div className="p-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
        <span className="text-3xl">⚠️</span>
        <h2 className="text-lg font-bold text-rose-700 dark:text-rose-400">
          Perfil de Segurado não localizado
        </h2>
        <p className="text-sm text-(--muted) max-w-md mx-auto">
          Não foi possível encontrar o cadastro de segurado vinculado ao seu usuário. Certifique-se de que sua conta possui vínculo ativo com a seguradora.
        </p>
      </div>
    );
  }

  const apolices = apolicesPage?.content || [];
  const sinistros = sinistrosPage?.content || [];
  const apolicesAtivas = apolices.filter((a) => a.status === "ATIVA");

  return (
    <div className="space-y-8">
      {/* Banner de Boas-vindas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-(--surface) border border-(--border)">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-(--fg)">
              Olá, {segurado.nomeRazaoSocial} 👋
            </h1>
          </div>
          <p className="text-sm text-(--muted) mt-1">
            CPF/CNPJ: {segurado.cpfCnpj} · {segurado.email}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/portal/sinistros/novo">
            <Button
              variant="primary"
              disabled={apolicesAtivas.length === 0}
            >
              + Abrir Sinistro
            </Button>
          </Link>
        </div>
      </div>

      {/* Seção de Apólices */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-(--fg)">Minhas Apólices</h2>
            <p className="text-xs text-(--muted)">
              {apolices.length} apólice(s) registrada(s) · {apolicesAtivas.length} ativa(s)
            </p>
          </div>
          {apolices.length > 3 && (
            <Link
              to="/portal/apolices"
              className="text-xs font-semibold text-(--accent) hover:underline"
            >
              Ver todas ({apolices.length}) →
            </Link>
          )}
        </div>

        {loadingApolices ? (
          <div className="p-6 text-center text-sm text-(--muted)">
            Carregando apólices...
          </div>
        ) : apolices.length === 0 ? (
          <div className="p-8 rounded-xl bg-(--surface) border border-(--border) text-center space-y-2">
            <span className="text-2xl">📋</span>
            <p className="text-sm font-medium text-(--fg)">
              Nenhuma apólice vinculada ao seu cadastro no momento.
            </p>
            <p className="text-xs text-(--muted)">
              Novas apólices contratadas aparecerão automaticamente aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {apolices.slice(0, 3).map((apolice) => (
              <MinhasApolicesCard key={apolice.id} apolice={apolice} />
            ))}
          </div>
        )}
      </section>

      {/* Seção de Sinistros */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-(--fg)">
              Meus Sinistros e Solicitações
            </h2>
            <p className="text-xs text-(--muted)">
              Acompanhe o andamento dos registros de sinistro em tempo real.
            </p>
          </div>
          <span className="text-xs text-(--muted)">
            {sinistros.length} registro(s)
          </span>
        </div>

        {loadingSinistros ? (
          <div className="p-6 text-center text-sm text-(--muted)">
            Carregando sinistros...
          </div>
        ) : sinistros.length === 0 ? (
          <div className="p-8 rounded-xl bg-(--surface) border border-(--border) text-center space-y-2">
            <span className="text-2xl">🛡️</span>
            <p className="text-sm font-medium text-(--fg)">
              Você não possui nenhum sinistro aberto.
            </p>
            <p className="text-xs text-(--muted)">
              Caso ocorra algum imprevisto com o bem segurado, utilize o botão "Abrir Sinistro".
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sinistros.map((sinistro) => (
              <div
                key={sinistro.id}
                className="p-5 rounded-xl bg-(--surface) border border-(--border) flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-(--border-strong) transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-(--fg)">
                      Sinistro #{sinistro.numeroSinistro}
                    </span>
                    <Badge variant={getSinistroStatusBadgeVariant(sinistro.status)}>
                      {formatarStatusSinistro(sinistro.status)}
                    </Badge>
                    <span className="text-xs text-(--muted)">
                      · {formatarTipoSinistro(sinistro.tipoSinistro)}
                    </span>
                  </div>

                  <p className="text-xs text-(--muted) line-clamp-2 max-w-2xl">
                    {sinistro.descricao}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-(--muted) pt-1">
                    <span>
                      Ocorrido em:{" "}
                      <strong className="text-(--fg)">
                        {formatarData(sinistro.dataOcorrencia)}
                      </strong>
                    </span>
                    <span>
                      Estimativa:{" "}
                      <strong className="text-emerald-600 font-mono">
                        {formatarMoeda(sinistro.valorEstimado)}
                      </strong>
                    </span>
                    {sinistro.status === "AGUARDANDO_DOCUMENTOS" && (
                      <span className="text-amber-600 font-semibold animate-pulse">
                        ⚠️ Documentação pendente
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <Link to={`/portal/sinistros/${sinistro.id}`}>
                    <Button variant="secondary" size="sm">
                      Ver Andamento →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

