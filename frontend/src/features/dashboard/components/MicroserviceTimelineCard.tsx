import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge";
import type { StatusSinistro } from "../../../interfaces/enums";
import { useHistoricoSinistro } from "../../sinistros/hooks/useSinistros";
import {
  formatarStatusSinistro,
  getSinistroStatusBadgeVariant,
} from "../../../utils/enumUtils";
import { formatarMoeda } from "../../../utils/formatters";

export interface MicroserviceTimelineSinistro {
  id?: string;
  numeroSinistro: string;
  seguradoNome?: string;
  numeroApolice?: string;
  tipoSinistro?: string;
  status: StatusSinistro;
  valorAprovado?: number;
  valorEstimado?: number;
  motivoRejeicao?: string;
  createdAt?: string;
  updatedAt?: string;
  analistaId?: string;
}

export interface MicroserviceTimelineCardProps {
  ultimoSinistro?: MicroserviceTimelineSinistro;
  sinistros?: MicroserviceTimelineSinistro[];
  sinistroSelecionadoId?: string | null;
  onSelecionarSinistro?: (id: string) => void;
  onVerDetalhes?: (sinistro: MicroserviceTimelineSinistro) => void;
  isLoading?: boolean;
}

interface TimelineStep {
  id: string;
  label: string;
  service: string;
  badge?: string;
  detail: string;
  timestamp?: string;
  status: "completed" | "in_progress" | "pending" | "rejected" | "skipped";
}

export const MicroserviceTimelineCard: React.FC<
  MicroserviceTimelineCardProps
> = ({
  ultimoSinistro,
  sinistros,
  sinistroSelecionadoId,
  onSelecionarSinistro,
  onVerDetalhes,
  isLoading = false,
}) => {
  // 1. Resolve o sinistro ativo a ser monitorado na esteira
  const sinistroAtivo = useMemo(() => {
    if (sinistroSelecionadoId && sinistros && sinistros.length > 0) {
      const encontrado = sinistros.find((s) => s.id === sinistroSelecionadoId);
      if (encontrado) return encontrado;
    }
    if (ultimoSinistro) return ultimoSinistro;
    if (sinistros && sinistros.length > 0) return sinistros[0];
    return undefined;
  }, [sinistroSelecionadoId, sinistros, ultimoSinistro]);

  // 2. Busca histórico de transições reais gravado no banco de dados para o sinistro ativo
  const { data: historico = [] } = useHistoricoSinistro(sinistroAtivo?.id);

  const formatarDataHora = (dataStr?: string | null): string | undefined => {
    if (!dataStr) return undefined;
    try {
      const d = new Date(dataStr);
      if (isNaN(d.getTime())) return undefined;
      return d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return undefined;
    }
  };

  // 3. Monta as etapas reais da esteira de microsserviços
  const steps = useMemo<TimelineStep[]>(() => {
    if (!sinistroAtivo) {
      return [];
    }

    const {
      status,
      valorAprovado,
      valorEstimado,
      motivoRejeicao,
      createdAt,
      analistaId,
    } = sinistroAtivo;

    // Resgata eventos gravados pelo sinistros-service
    const histEmAnalise = historico.find(
      (h) =>
        h.statusNovo === "EM_ANALISE" ||
        h.statusNovo === "AGUARDANDO_DOCUMENTOS",
    );
    const histDecisao = historico.find(
      (h) => h.statusNovo === "APROVADO" || h.statusNovo === "REJEITADO",
    );
    const histPago = historico.find((h) => h.statusNovo === "PAGO");

    const dataRegistro = formatarDataHora(createdAt);
    const dataAnalise = formatarDataHora(histEmAnalise?.createdAt);
    const dataDecisao = formatarDataHora(histDecisao?.createdAt);
    const dataPago = formatarDataHora(histPago?.createdAt);

    const isRegistrado = status === "REGISTRADO";
    const isAguardandoDocs = status === "AGUARDANDO_DOCUMENTOS";
    const isEmAnalise = status === "EM_ANALISE";
    const isAprovado = status === "APROVADO";
    const isPago = status === "PAGO";
    const isRejeitado = status === "REJEITADO";

    const valorAprovadoOuEstimado = valorAprovado ?? valorEstimado;

    return [
      // 1. Registro e Validações REST Feign
      {
        id: "step-1",
        label: "Registro & Validação",
        service: "sinistros-service",
        badge: "OpenFeign",
        detail:
          "Segurado e apólice ativa validados. Evento sinistro.registrado publicado.",
        timestamp: dataRegistro,
        status: "completed",
      },
      // 2. Análise Técnica
      {
        id: "step-2",
        label: isAguardandoDocs
          ? "Aguardando Documentos"
          : isEmAnalise
            ? "Em Análise Técnica"
            : isRegistrado
              ? "Aguardando Triagem"
              : "Análise Concluída",
        service: "sinistros-service",
        badge: "Triagem",
        detail: isAguardandoDocs
          ? "Aguardando envio de comprovantes adicionais pelo segurado."
          : isEmAnalise
            ? analistaId
              ? "Analista avaliando coberturas e laudos."
              : "Em análise na fila de trabalho."
            : isRegistrado
              ? "Pendente na fila para triagem de um analista."
              : "Laudo técnico e análise documental finalizados.",
        timestamp: dataAnalise,
        status: isRegistrado
          ? "pending"
          : isEmAnalise || isAguardandoDocs
            ? "in_progress"
            : "completed",
      },
      // 3. Decisão Técnica do Sinistro
      {
        id: "step-3",
        label: isRejeitado
          ? "Sinistro Rejeitado"
          : isAprovado || isPago
            ? "Sinistro Aprovado"
            : "Decisão do Sinistro",
        service: "sinistros-service",
        badge: "Kafka Event",
        detail: isRejeitado
          ? `Parecer desfavorável: ${motivoRejeicao || "Recusado pelo analista"}. Evento sinistro.rejeitado.`
          : isAprovado || isPago
            ? `Aprovado: ${formatarMoeda(valorAprovadoOuEstimado)}. Evento sinistro.aprovado.`
            : `Estimado: ${formatarMoeda(valorEstimado)}. Aguardando parecer do analista.`,
        timestamp: dataDecisao,
        status: isRejeitado
          ? "rejected"
          : isAprovado || isPago
            ? "completed"
            : isEmAnalise || isAguardandoDocs
              ? "in_progress"
              : "pending",
      },
      // 4. Liquidação Financeira
      {
        id: "step-4",
        label: isRejeitado
          ? "Liquidação Dispensada"
          : isPago
            ? "Pagamento Liquidado"
            : isAprovado
              ? "Processando Pagamento..."
              : "Liquidação Financeira",
        service: "liquidacao-service",
        badge: "Kafka Worker",
        detail: isRejeitado
          ? "Sinistro recusado. Fluxo financeiro não acionado."
          : isPago
            ? "Consumiu sinistro.aprovado e emitiu pagamento.liquidado."
            : isAprovado
              ? "Worker consumindo evento para executar ordem bancária."
              : "Aguardando aprovação para processar liquidação.",
        timestamp: dataPago,
        status: isRejeitado
          ? "skipped"
          : isPago
            ? "completed"
            : isAprovado
              ? "in_progress"
              : "pending",
      },
      // 5. Notificação ao Cliente
      {
        id: "step-5",
        label: isPago
          ? "Segurado Notificado"
          : isRejeitado
            ? "Notificado da Recusa"
            : isAprovado
              ? "Notificação em Envio"
              : isRegistrado
                ? "Abertura Notificada"
                : "Notificação de Desfecho",
        service: "notificacao-service",
        badge: "Kafka Worker",
        detail: isPago
          ? "Comprovante de pagamento enviado ao segurado."
          : isRejeitado
            ? "Justificativa de recusa enviada ao segurado."
            : isAprovado
              ? "Aviso de aprovação despachado, aguardando liquidação."
              : isRegistrado
                ? "Confirmação de abertura enviada ao segurado."
                : "Aguardando desfecho do ciclo para envio de notificação.",
        timestamp:
          isPago
            ? dataPago
            : isRejeitado
              ? dataDecisao
              : isRegistrado
                ? dataRegistro
                : undefined,
        status:
          isPago || isRejeitado || isRegistrado
            ? "completed"
            : isAprovado
              ? "in_progress"
              : "pending",
      },
    ];
  }, [sinistroAtivo, historico]);

  // Estado de carregamento inicial
  if (isLoading) {
    return (
      <div className="bg-(--surface) border border-(--border) rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-6 h-full animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-(--surface-2) rounded" />
          <div className="h-3 w-48 bg-(--surface-2) rounded" />
        </div>
        <div className="space-y-4 pl-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-(--surface-2)" />
              <div className="space-y-1 flex-1">
                <div className="h-3.5 w-28 bg-(--surface-2) rounded" />
                <div className="h-2.5 w-40 bg-(--surface-2) rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-10 bg-(--surface-2) rounded-xl" />
      </div>
    );
  }

  // Estado vazio quando não há sinistros para exibir
  if (!sinistroAtivo) {
    return (
      <div className="bg-(--surface) border border-(--border) rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center h-full min-h-90">
        <div className="w-12 h-12 rounded-xl bg-(--surface-2) border border-(--border) flex items-center justify-center text-(--muted) mb-3">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-(--fg)">
          Nenhum sinistro na esteira
        </h3>
        <p className="text-xs text-(--muted) mt-1 max-w-60">
          Assim que sinistros forem registrados, o rastreamento em tempo real
          dos microsserviços aparecerá aqui.
        </p>
        <Link
          to="/sinistros"
          className="mt-4 text-xs font-medium text-(--accent-ink) hover:underline"
        >
          Ir para sinistros →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-(--surface) border border-(--border) rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-5 h-full">
      {/* 1. Cabeçalho com Título, Seletor e Status */}
      <div className="shrink-0 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-semibold text-(--fg) tracking-tight">
              Esteira de microsserviços
            </h2>
            <p className="text-[11.5px] text-(--muted) mt-0.5">
              Rastreamento event-driven ponta a ponta
            </p>
          </div>
          <Badge
            variant={getSinistroStatusBadgeVariant(sinistroAtivo.status)}
            className="text-[10px] uppercase font-semibold px-2 py-0.5"
          >
            {formatarStatusSinistro(sinistroAtivo.status)}
          </Badge>
        </div>

        {/* Seletor dinâmico para alternar entre sinistros da fila */}
        {sinistros && sinistros.length > 1 ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-(--muted) shrink-0 font-medium">
              Inspecionando:
            </span>
            <select
              value={sinistroAtivo.id}
              onChange={(e) => onSelecionarSinistro?.(e.target.value)}
              className="text-[11.5px] font-medium text-(--fg) bg-(--surface-2) border border-(--border) rounded-lg px-2 py-1 truncate focus:outline-none focus:ring-1 focus:ring-(--accent) w-full"
            >
              {sinistros.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.numeroSinistro} • {s.seguradoNome || "Segurado"} (
                  {formatarStatusSinistro(s.status)})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-[12px] text-(--muted) truncate bg-(--surface-2)/60 px-2.5 py-1.5 rounded-lg border border-(--border)/60">
            <span className="font-semibold text-(--fg)">
              {sinistroAtivo.numeroSinistro}
            </span>
            {sinistroAtivo.seguradoNome && (
              <span> • {sinistroAtivo.seguradoNome}</span>
            )}
          </div>
        )}
      </div>

      {/* 2. Lista Vertical de Etapas da Esteira */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.75 before:top-2 before:bottom-3 before:w-0.5 before:bg-(--border) flex-1">
        {steps.map((step) => {
          return (
            <div key={step.id} className="relative flex items-start gap-3">
              {/* Ícone de status na linha do tempo */}
              <div className="absolute -left-6 top-0.5 flex items-center justify-center">
                {step.status === "completed" && (
                  <div
                    className="w-5.5 h-5.5 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-(--surface)"
                    title="Etapa concluída"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}

                {step.status === "in_progress" && (
                  <div
                    className="w-5.5 h-5.5 rounded-full bg-amber-600 text-white flex items-center justify-center ring-4 ring-(--surface) animate-pulse"
                    title="Etapa em processamento"
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}

                {step.status === "rejected" && (
                  <div
                    className="w-5.5 h-5.5 rounded-full bg-rose-600 text-white flex items-center justify-center ring-4 ring-(--surface)"
                    title="Sinistro rejeitado"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                )}

                {step.status === "skipped" && (
                  <div
                    className="w-5.5 h-5.5 rounded-full bg-(--surface-2) border-2 border-(--border) flex items-center justify-center ring-4 ring-(--surface)"
                    title="Etapa não aplicável"
                  >
                    <div className="w-2 h-0.5 bg-(--muted)" />
                  </div>
                )}

                {step.status === "pending" && (
                  <div
                    className="w-5.5 h-5.5 rounded-full bg-(--surface-2) border-2 border-(--border) flex items-center justify-center ring-4 ring-(--surface)"
                    title="Aguardando etapa anterior"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-(--faint)" />
                  </div>
                )}
              </div>

              {/* Informações detalhadas da etapa */}
              <div className="flex flex-col min-w-0 flex-1 ml-1">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`text-[12.5px] tracking-tight font-medium ${
                        step.status === "pending"
                          ? "text-(--muted)"
                          : step.status === "rejected"
                            ? "text-rose-600 font-semibold"
                            : "text-(--fg)"
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.badge && (
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-(--surface-2) text-(--muted) font-mono uppercase border border-(--border)/60">
                        {step.badge}
                      </span>
                    )}
                  </div>
                  {step.timestamp && (
                    <span className="text-[10.5px] font-mono text-(--muted) shrink-0">
                      {step.timestamp}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between gap-2 mt-0.5">
                  <p className="text-[11px] text-(--muted) leading-tight line-clamp-2">
                    {step.detail}
                  </p>
                  <span className="text-[10px] font-mono text-(--faint) shrink-0">
                    {step.service}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Rodapé com Card Resumo do Sinistro e Ação */}
      <div className="pt-3 border-t border-(--border) flex items-center justify-between gap-3 shrink-0">
        <div className="text-[11px] text-(--muted) truncate">
          {sinistroAtivo.numeroApolice && (
            <span className="font-mono">{sinistroAtivo.numeroApolice} • </span>
          )}
          <span>
            {sinistroAtivo.valorAprovado
              ? formatarMoeda(sinistroAtivo.valorAprovado)
              : sinistroAtivo.valorEstimado
                ? `Est. ${formatarMoeda(sinistroAtivo.valorEstimado)}`
                : "Sem valor"}
          </span>
        </div>

        {onVerDetalhes ? (
          <button
            type="button"
            onClick={() => onVerDetalhes(sinistroAtivo)}
            className="text-[11.5px] font-medium text-(--accent-ink) hover:underline flex items-center gap-1 cursor-pointer shrink-0"
          >
            Ver detalhes →
          </button>
        ) : (
          <Link
            to="/sinistros"
            className="text-[11.5px] font-medium text-(--accent-ink) hover:underline flex items-center gap-1 shrink-0"
          >
            Ver no módulo →
          </Link>
        )}
      </div>
    </div>
  );
};

