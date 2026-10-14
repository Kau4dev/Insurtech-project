import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMeuPerfilSegurado } from "../hooks/useMeuPerfilSegurado";
import { useMinhasApolices } from "../hooks/useMinhasApolices";
import { useMeusSinistros } from "../hooks/useMeusSinistros";
import { MinhasApolicesCard } from "../components/MinhasApolicesCard";
import { Badge, Button, Pagination } from "../../../components/ui";
import {
  formatarCpfCnpj,
  formatarData,
  formatarMoeda,
} from "../../../utils/formatters";
import {
  formatarStatusSinistro,
  formatarTipoSinistro,
  getSinistroStatusBadgeVariant,
} from "../../../utils/enumUtils";

export const PortalDashboardPage: React.FC = () => {
  const {
    data: segurado,
    isLoading: loadingSegurado,
    isError: erroSegurado,
  } = useMeuPerfilSegurado();

  const seguradoId = segurado?.id || "";

  const [sinistrosPageNum, setSinistrosPageNum] = useState(0);
  const sinistrosPageSize = 5;

  const { data: apolicesPage, isLoading: loadingApolices } =
    useMinhasApolices(seguradoId);
  const { data: sinistrosPage, isLoading: loadingSinistros } =
    useMeusSinistros(seguradoId);

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

  if (erroSegurado || !segurado) {
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
          Não foi possível encontrar o cadastro de segurado vinculado ao seu
          usuário. Certifique-se de que sua conta possui vínculo ativo com a
          seguradora.
        </p>
      </div>
    );
  }

  const apolices = apolicesPage?.content || [];
  const sinistros = sinistrosPage?.content || [];
  const apolicesAtivas = apolices.filter((a) => a.status === "ATIVA");
  const sinistrosEmAberto = sinistros.filter(
    (s) => s.status !== "PAGO" && s.status !== "REJEITADO"
  );
  const coberturaTotal = apolicesAtivas.reduce(
    (acc, a) => acc + (a.valorSeguro || 0),
    0
  );

  const totalSinistros = sinistros.length;
  const totalSinistrosPages = Math.ceil(totalSinistros / sinistrosPageSize);
  const currentSinistrosPage = Math.min(
    sinistrosPageNum,
    Math.max(0, totalSinistrosPages - 1)
  );
  const sinistrosPaginados = sinistros.slice(
    currentSinistrosPage * sinistrosPageSize,
    (currentSinistrosPage + 1) * sinistrosPageSize
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Banner de Boas-vindas e Resumo do Segurado */}
      <div className="p-5 sm:p-6 rounded-(--radius) bg-(--surface) border border-(--border) shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-(--accent-ink)">
                Área do Cliente
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Cadastro Ativo
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-(--fg) mt-1">
              Olá, {segurado.nomeRazaoSocial}
            </h1>
            <p className="text-xs text-(--muted) font-mono mt-1">
              Doc: {formatarCpfCnpj(segurado.cpfCnpj, segurado.tipoPessoa)} ·{" "}
              {segurado.email}
            </p>
          </div>

          <div className="shrink-0">
            <Link to="/portal/sinistros/novo">
              <Button
                variant="primary"
                disabled={apolicesAtivas.length === 0}
                className="w-full sm:w-auto h-10 text-xs font-semibold justify-center gap-2 shadow-2xs active:scale-[0.99]"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span>Abrir Sinistro</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Indicadores Rápidos do Segurado */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-(--border)">
          <div className="p-3 rounded-lg bg-(--surface-2)/40 border border-(--border)">
            <span className="text-[11px] font-medium text-(--muted)">
              Apólices Ativas
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-(--fg) font-mono num">
                {apolicesAtivas.length}
              </span>
              <span className="text-[11px] text-(--muted)">
                de {apolices.length} total
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-(--surface-2)/40 border border-(--border)">
            <span className="text-[11px] font-medium text-(--muted)">
              Sinistros em Regulação
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-(--fg) font-mono num">
                {sinistrosEmAberto.length}
              </span>
              <span className="text-[11px] text-(--muted)">
                {sinistrosEmAberto.length === 0
                  ? "Nenhum processo pendente"
                  : "em andamento"}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-(--surface-2)/40 border border-(--border)">
            <span className="text-[11px] font-medium text-(--muted)">
              Cobertura Total Ativa
            </span>
            <div className="mt-1">
              <span className="text-lg font-bold text-(--accent-ink) font-mono num">
                {formatarMoeda(coberturaTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Apólices */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-(--fg) tracking-tight">
              Minhas Apólices
            </h2>
            <p className="text-xs text-(--muted)">
              {apolices.length} apólice(s) registrada(s) · {apolicesAtivas.length}{" "}
              ativa(s)
            </p>
          </div>
          {apolices.length > 3 && (
            <Link
              to="/portal/apolices"
              className="text-xs font-semibold text-(--accent) hover:text-(--accent-ink) hover:underline transition-colors"
            >
              Ver todas ({apolices.length}) →
            </Link>
          )}
        </div>

        {loadingApolices ? (
          <div className="p-8 text-center text-xs text-(--muted)">
            Carregando apólices...
          </div>
        ) : apolices.length === 0 ? (
          <div className="p-8 rounded-(--radius) bg-(--surface) border border-(--border) text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-(--surface-2) text-(--muted) flex items-center justify-center mx-auto">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-(--fg)">
              Nenhuma apólice vinculada ao seu cadastro no momento.
            </p>
            <p className="text-xs text-(--muted)">
              Novas apólices contratadas aparecerão automaticamente aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {apolices.slice(0, 3).map((apolice) => (
              <MinhasApolicesCard key={apolice.id} apolice={apolice} />
            ))}
          </div>
        )}
      </section>

      {/* Seção de Sinistros */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-(--fg) tracking-tight">
              Meus Sinistros e Solicitações
            </h2>
            <p className="text-xs text-(--muted)">
              Acompanhe o andamento dos registros de sinistro em tempo real.
            </p>
          </div>
          <span className="text-xs text-(--muted) font-mono">
            {sinistros.length} registro(s)
          </span>
        </div>

        {loadingSinistros ? (
          <div className="p-8 text-center text-xs text-(--muted)">
            Carregando sinistros...
          </div>
        ) : sinistros.length === 0 ? (
          <div className="p-8 rounded-(--radius) bg-(--surface) border border-(--border) text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-(--surface-2) text-(--muted) flex items-center justify-center mx-auto">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-(--fg)">
              Você não possui nenhum sinistro aberto.
            </p>
            <p className="text-xs text-(--muted)">
              Caso ocorra algum imprevisto com o bem segurado, utilize o botão
              "Abrir Sinistro".
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {sinistrosPaginados.map((sinistro) => (
                <div
                  key={sinistro.id}
                  className="p-4 sm:p-5 rounded-(--radius) bg-(--surface) border border-(--border) flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-(--border-strong) transition-colors shadow-2xs"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-(--fg)">
                        Sinistro #{sinistro.numeroSinistro}
                      </span>
                      <Badge
                        variant={getSinistroStatusBadgeVariant(sinistro.status)}
                      >
                        {formatarStatusSinistro(sinistro.status)}
                      </Badge>
                      <span className="text-xs text-(--muted)">
                        · {formatarTipoSinistro(sinistro.tipoSinistro)}
                      </span>
                    </div>

                    <p className="text-xs text-(--muted) line-clamp-2 max-w-2xl leading-relaxed">
                      {sinistro.descricao}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-(--muted) pt-1">
                      <span>
                        Ocorrido em:{" "}
                        <strong className="text-(--fg) font-mono">
                          {formatarData(sinistro.dataOcorrencia)}
                        </strong>
                      </span>
                      <span>
                        Estimativa:{" "}
                        <strong className="text-(--accent-ink) font-mono num">
                          {formatarMoeda(sinistro.valorEstimado)}
                        </strong>
                      </span>
                      {sinistro.status === "AGUARDANDO_DOCUMENTOS" && (
                        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <svg
                            className="w-3 h-3 text-amber-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          Documentação pendente
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto">
                    <Link
                      to={`/portal/sinistros/${sinistro.id}`}
                      className="block w-full sm:w-auto"
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full sm:w-auto justify-center text-xs"
                      >
                        Ver Andamento →
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {totalSinistros > sinistrosPageSize && (
              <div className="pt-2">
                <Pagination
                  currentPage={currentSinistrosPage}
                  totalPages={totalSinistrosPages}
                  totalElements={totalSinistros}
                  pageSize={sinistrosPageSize}
                  onPageChange={setSinistrosPageNum}
                />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
