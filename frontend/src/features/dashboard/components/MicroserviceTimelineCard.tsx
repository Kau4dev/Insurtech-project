import React, { useMemo } from "react";
import type { StatusSinistro } from "../../../interfaces/enums";

export interface MicroserviceTimelineCardProps {
  ultimoSinistro?: {
    numeroSinistro: string;
    seguradoNome?: string;
    status: StatusSinistro;
    valorAprovado?: number;
    valorEstimado?: number;
  };
}

interface TimelineStep {
  id: string;
  label: string;
  service: string;
  status: "completed" | "in_progress" | "pending";
}

export const MicroserviceTimelineCard: React.FC<
  MicroserviceTimelineCardProps
> = ({ ultimoSinistro }) => {
  const steps = useMemo<TimelineStep[]>(() => {
    if (!ultimoSinistro) {
      return [
        {
          id: "step-1",
          label: "Registrado",
          service: "sinistros-service",
          status: "completed",
        },
        {
          id: "step-2",
          label: "Em análise",
          service: "sinistros-service",
          status: "completed",
        },
        {
          id: "step-3",
          label: "Aprovado",
          service: "valor 4,2k",
          status: "completed",
        },
        {
          id: "step-4",
          label: "Liquidando...",
          service: "liquidacao-service",
          status: "in_progress",
        },
        {
          id: "step-5",
          label: "Notificado",
          service: "notificacao-service",
          status: "pending",
        },
      ];
    }

    const { status, valorAprovado, valorEstimado } = ultimoSinistro;
    const valor = valorAprovado || valorEstimado || 4200;
    const valorFormatado =
      valor >= 1000
        ? `${(valor / 1000).toFixed(1).replace(".", ",")}k`
        : `${valor}`;

    const isRegistrado = status === "REGISTRADO";
    const isEmAnalise =
      status === "EM_ANALISE" || status === "AGUARDANDO_DOCUMENTOS";
    const isAprovado = status === "APROVADO";
    const isPago = status === "PAGO";

    return [
      {
        id: "step-1",
        label: "Registrado",
        service: "sinistros-service",
        status: "completed",
      },
      {
        id: "step-2",
        label: "Em análise",
        service: "sinistros-service",
        status: isRegistrado ? "in_progress" : "completed",
      },
      {
        id: "step-3",
        label: "Aprovado",
        service: `valor ${valorFormatado}`,
        status: isRegistrado
          ? "pending"
          : isEmAnalise
            ? "in_progress"
            : "completed",
      },
      {
        id: "step-4",
        label: isPago ? "Liquidado" : "Liquidando...",
        service: "liquidacao-service",
        status: isPago ? "completed" : isAprovado ? "in_progress" : "pending",
      },
      {
        id: "step-5",
        label: "Notificado",
        service: "notificacao-service",
        status: isPago ? "completed" : "pending",
      },
    ];
  }, [ultimoSinistro]);

  return (
    <div className="bg-(--surface) border border-(--border) rounded-2xl p-5 shadow-xs flex flex-col justify-start gap-6 h-full">
      {/* Cabeçalho */}
      <div className="mb-5">
        <h2 className="text-[15px] font-semibold text-(--fg) tracking-tight">
          Ciclo de emissão
        </h2>
        <p className="text-[12px] text-(--muted) mt-0.5 truncate">
          {ultimoSinistro
            ? `${ultimoSinistro.seguradoNome || "Segurado mais recente"} (${ultimoSinistro.numeroSinistro})`
            : "Segurado mais recente demonstrado ponto a ponto."}
        </p>
      </div>

      {/* Lista vertical de etapas conectadas */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.75 before:top-2 before:bottom-3 before:w-0.5 before:bg-(--border)">
        {steps.map((step) => {
          return (
            <div key={step.id} className="relative flex items-center gap-3">
              {/* Ícone de status */}
              <div className="absolute -left-6 flex items-center justify-center">
                {step.status === "completed" && (
                  <div className="w-5.5 h-5.5 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-(--surface)">
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
                  <div className="w-5.5 h-5.5 rounded-full bg-amber-600 text-white flex items-center justify-center ring-4 ring-(--surface) animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}

                {step.status === "pending" && (
                  <div className="w-5.5 h-5.5 rounded-full bg-(--surface-2) border-2 border-(--border) flex items-center justify-center ring-4 ring-(--surface)">
                    <div className="w-1.5 h-1.5 rounded-full bg-(--faint)" />
                  </div>
                )}
              </div>

              {/* Rótulo da etapa e microservice correspondente */}
              <div className="flex items-baseline gap-2 min-w-0">
                <span
                  className={`text-[13px] tracking-tight font-medium ${
                    step.status === "pending" ? "text-(--muted)" : "text-(--fg)"
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[11.5px] font-mono text-(--muted) truncate">
                  {step.service}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
