import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { sinistrosApi } from "../../../api/sinistrosApi";
import { sincronizarNotificacoes } from "../../../hooks/useNotificacoes";
import { SinistroTimeline } from "../components/SinistroTimeline";
import { UploadDocumentoSegurado } from "../components/UploadDocumentoSegurado";
import { Badge, Button, DetailField } from "../../../components/ui";
import { formatarData, formatarMoeda } from "../../../utils/formatters";
import {
  formatarStatusSinistro,
  formatarTipoDocumento,
  formatarTipoSinistro,
  getSinistroStatusBadgeVariant,
} from "../../../utils/enumUtils";

export const PortalSinistroDetailPage: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const {
    data: sinistro,
    isLoading: loadingSinistro,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["portal-sinistro-detalhe", id],
    queryFn: () => sinistrosApi.buscarPorId(id),
    enabled: Boolean(id),
  });

  const { data: historico = [] } = useQuery({
    queryKey: ["portal-sinistro-historico", id],
    queryFn: () => sinistrosApi.mostrarHistorico(id),
    enabled: Boolean(id),
  });

  if (loadingSinistro) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="animate-spin w-8 h-8 border-2 border-(--accent) border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-(--muted) font-medium">
          Carregando andamento do sinistro...
        </p>
      </div>
    );
  }

  if (isError || !sinistro) {
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
          Sinistro não encontrado
        </h2>
        <p className="text-xs text-(--muted)">
          Não foi possível carregar os detalhes do sinistro solicitado.
        </p>
        <Link to="/portal">
          <Button variant="secondary" size="sm">
            Voltar ao Início
          </Button>
        </Link>
      </div>
    );
  }

  const handleDocumentoSucesso = () => {
    setMensagemSucesso(
      "Documento anexado com sucesso! O sinistro retornará para análise técnica."
    );
    refetch();
    queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
    sincronizarNotificacoes();
    setTimeout(() => setMensagemSucesso(null), 6000);
  };

  const documentos = sinistro.documentos || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header com navegação e status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <span className="text-(--fg) font-medium">
              Sinistro #{sinistro.numeroSinistro}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-(--fg)">
              Sinistro #{sinistro.numeroSinistro}
            </h1>
            <Badge variant={getSinistroStatusBadgeVariant(sinistro.status)}>
              {formatarStatusSinistro(sinistro.status)}
            </Badge>
          </div>
          <p className="text-xs text-(--muted) mt-0.5">
            Registrado em{" "}
            {formatarData(sinistro.createdAt || sinistro.dataOcorrencia)}
          </p>
        </div>

        <Link to="/portal" className="self-start sm:self-auto">
          <Button variant="secondary" size="sm" className="text-xs gap-1.5">
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Voltar ao Início</span>
          </Button>
        </Link>
      </div>

      {mensagemSucesso && (
        <div className="p-3.5 rounded-(--radius) bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-emerald-600 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{mensagemSucesso}</span>
          </div>
          <button
            onClick={() => setMensagemSucesso(null)}
            className="text-xs font-semibold hover:underline cursor-pointer shrink-0"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Linha do Tempo Visual */}
      <SinistroTimeline
        statusAtual={sinistro.status}
        motivoRejeicao={sinistro.motivoRejeicao}
      />

      {/* Upload de Documentos se o status for AGUARDANDO_DOCUMENTOS */}
      {sinistro.status === "AGUARDANDO_DOCUMENTOS" && (
        <UploadDocumentoSegurado
          sinistroId={sinistro.id || id}
          onSuccess={handleDocumentoSucesso}
        />
      )}

      {/* Detalhes do Sinistro */}
      <div className="p-5 sm:p-6 rounded-(--radius) bg-(--surface) border border-(--border) shadow-xs space-y-4">
        <h3 className="font-bold text-base text-(--fg) tracking-tight">
          Dados da Ocorrência
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <DetailField
            label="Tipo de Sinistro"
            value={formatarTipoSinistro(sinistro.tipoSinistro)}
          />
          <DetailField
            label="Data da Ocorrência"
            value={formatarData(sinistro.dataOcorrencia)}
          />
          <DetailField
            label="Prejuízo Estimado"
            value={formatarMoeda(sinistro.valorEstimado)}
          />
          {sinistro.valorAprovado != null ? (
            <DetailField
              label="Valor Indenizado / Aprovado"
              value={formatarMoeda(sinistro.valorAprovado)}
            />
          ) : (
            <DetailField
              label="Situação da Indenização"
              value="Em cálculo de regulação"
            />
          )}
        </div>

        <div className="pt-3 border-t border-(--border)">
          <span className="text-[11px] font-mono font-semibold text-(--muted) uppercase tracking-wider">
            Descrição do Fato
          </span>
          <p className="text-sm text-(--fg) mt-1.5 p-3.5 rounded-lg bg-(--surface-2)/60 border border-(--border) whitespace-pre-wrap leading-relaxed">
            {sinistro.descricao}
          </p>
        </div>
      </div>

      {/* Documentos Anexados */}
      <div className="p-5 sm:p-6 rounded-(--radius) bg-(--surface) border border-(--border) shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-(--fg) tracking-tight">
            Documentos Vinculados ({documentos.length})
          </h3>
        </div>

        {documentos.length === 0 ? (
          <p className="text-xs text-(--muted)">
            Nenhum documento anexado a este sinistro até o momento.
          </p>
        ) : (
          <div className="space-y-2.5">
            {documentos.map((doc, idx) => (
              <div
                key={doc.id || idx}
                className="p-3.5 rounded-lg bg-(--surface-2)/50 border border-(--border) flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-(--surface) text-(--muted) flex items-center justify-center shrink-0 border border-(--border)">
                    <svg
                      className="w-4 h-4 text-(--accent-ink)"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-(--fg)">
                      {doc.nomeArquivo}
                    </span>
                    <span className="text-(--muted) ml-2">
                      · {formatarTipoDocumento(doc.tipoDocumento)}
                    </span>
                    {doc.dataUpload && (
                      <span className="text-[11px] text-(--muted) block mt-0.5 font-mono">
                        Enviado em {formatarData(doc.dataUpload)}
                      </span>
                    )}
                  </div>
                </div>

                {doc.urlArquivo && (
                  <a
                    href={doc.urlArquivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-(--accent) hover:text-(--accent-ink) hover:underline font-semibold shrink-0"
                  >
                    <span>Abrir Documento</span>
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Histórico de Mudanças de Status */}
      {historico.length > 0 && (
        <div className="p-5 sm:p-6 rounded-(--radius) bg-(--surface) border border-(--border) shadow-xs space-y-4">
          <h3 className="font-bold text-base text-(--fg) tracking-tight">
            Histórico de Alterações de Status
          </h3>

          <div className="space-y-2.5">
            {historico.map((h, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-(--surface-2)/40 border border-(--border) flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-(--muted) text-[11px]">De:</span>
                    <Badge variant="neutral">
                      {formatarStatusSinistro(h.statusAnterior)}
                    </Badge>
                    <span className="text-(--muted) text-[11px]">→ Para:</span>
                    <Badge variant={getSinistroStatusBadgeVariant(h.statusNovo)}>
                      {formatarStatusSinistro(h.statusNovo)}
                    </Badge>
                  </div>
                  {h.observacao && (
                    <p className="text-xs text-(--fg) mt-1.5 italic bg-(--surface) p-2 rounded border border-(--border)/60">
                      "{h.observacao}"
                    </p>
                  )}
                </div>

                {h.createdAt && (
                  <span className="text-[11px] text-(--muted) font-mono shrink-0">
                    {formatarData(h.createdAt)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
