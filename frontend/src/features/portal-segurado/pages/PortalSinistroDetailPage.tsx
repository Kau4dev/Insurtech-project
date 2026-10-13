import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { sinistrosApi } from "../../../api/sinistrosApi";
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
      <div className="py-16 text-center space-y-3">
        <div className="animate-spin w-8 h-8 border-2 border-(--accent) border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-(--muted)">Carregando andamento do sinistro...</p>
      </div>
    );
  }

  if (isError || !sinistro) {
    return (
      <div className="p-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
        <span className="text-3xl">⚠️</span>
        <h2 className="text-lg font-bold text-rose-700 dark:text-rose-400">
          Sinistro não encontrado
        </h2>
        <p className="text-sm text-(--muted)">
          Não foi possível carregar os detalhes do sinistro solicitado.
        </p>
        <Link to="/portal">
          <Button variant="secondary">Voltar ao Início</Button>
        </Link>
      </div>
    );
  }

  const handleDocumentoSucesso = () => {
    setMensagemSucesso(
      "Documento anexado com sucesso! O sinistro retornará para análise técnica."
    );
    refetch();
    setTimeout(() => setMensagemSucesso(null), 6000);
  };

  const documentos = sinistro.documentos || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header com navegação e status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-(--muted) mb-1">
            <Link to="/portal" className="hover:underline">
              Portal
            </Link>
            <span>/</span>
            <span className="text-(--fg)">Sinistro #{sinistro.numeroSinistro}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-(--fg)">
              Sinistro #{sinistro.numeroSinistro}
            </h1>
            <Badge variant={getSinistroStatusBadgeVariant(sinistro.status)}>
              {formatarStatusSinistro(sinistro.status)}
            </Badge>
          </div>
          <p className="text-xs text-(--muted) mt-0.5">
            Registrado em {formatarData(sinistro.createdAt || sinistro.dataOcorrencia)}
          </p>
        </div>

        <Link to="/portal">
          <Button variant="secondary" size="sm">
            ← Voltar ao Início
          </Button>
        </Link>
      </div>

      {mensagemSucesso && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center justify-between">
          <span>✓ {mensagemSucesso}</span>
          <button
            onClick={() => setMensagemSucesso(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
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
      <div className="p-6 rounded-2xl bg-(--surface) border border-(--border) space-y-4">
        <h3 className="font-bold text-base text-(--fg)">
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
          <span className="text-xs font-semibold text-(--muted) uppercase tracking-wider">
            Descrição do Fato
          </span>
          <p className="text-sm text-(--fg) mt-1 p-3 rounded-lg bg-(--surface-2) whitespace-pre-wrap">
            {sinistro.descricao}
          </p>
        </div>
      </div>

      {/* Documentos Anexados */}
      <div className="p-6 rounded-2xl bg-(--surface) border border-(--border) space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-(--fg)">
            Documentos Vinculados ({documentos.length})
          </h3>
        </div>

        {documentos.length === 0 ? (
          <p className="text-xs text-(--muted)">
            Nenhum documento anexado a este sinistro até o momento.
          </p>
        ) : (
          <div className="space-y-2">
            {documentos.map((doc, idx) => (
              <div
                key={doc.id || idx}
                className="p-3 rounded-lg bg-(--surface-2)/60 border border-(--border) flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📄</span>
                  <div>
                    <span className="font-semibold text-(--fg)">
                      {doc.nomeArquivo}
                    </span>
                    <span className="text-(--muted) ml-2">
                      · {formatarTipoDocumento(doc.tipoDocumento)}
                    </span>
                    {doc.dataUpload && (
                      <span className="text-[11px] text-(--muted) block">
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
                    className="text-xs text-(--accent) hover:underline font-medium shrink-0"
                  >
                    Abrir Documento ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Histórico de Mudanças de Status */}
      {historico.length > 0 && (
        <div className="p-6 rounded-2xl bg-(--surface) border border-(--border) space-y-4">
          <h3 className="font-bold text-base text-(--fg)">
            Histórico de Alterações de Status
          </h3>

          <div className="space-y-3">
            {historico.map((h, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-(--surface-2)/40 border border-(--border) flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-(--muted)">De:</span>
                    <Badge variant="neutral">
                      {formatarStatusSinistro(h.statusAnterior)}
                    </Badge>
                    <span className="text-(--muted)">→ Para:</span>
                    <Badge variant={getSinistroStatusBadgeVariant(h.statusNovo)}>
                      {formatarStatusSinistro(h.statusNovo)}
                    </Badge>
                  </div>
                  {h.observacao && (
                    <p className="text-xs text-(--fg) mt-1 italic">
                      "{h.observacao}"
                    </p>
                  )}
                </div>

                {h.createdAt && (
                  <span className="text-[11px] text-(--muted) shrink-0">
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

