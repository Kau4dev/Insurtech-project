import React from "react";
import type { StatusSinistro } from "../../../interfaces/enums";

interface SinistroTimelineProps {
  statusAtual: StatusSinistro | string;
  motivoRejeicao?: string;
}

const ETAPAS: { status: StatusSinistro; label: string; desc: string }[] = [
  {
    status: "REGISTRADO",
    label: "Registrado",
    desc: "Sinistro recebido com sucesso.",
  },
  {
    status: "EM_ANALISE",
    label: "Em Análise",
    desc: "Analista técnico avaliando.",
  },
  {
    status: "AGUARDANDO_DOCUMENTOS",
    label: "Pendente de Documentos",
    desc: "Documentos complementares solicitados.",
  },
  {
    status: "APROVADO",
    label: "Aprovado",
    desc: "Aprovado para indenização.",
  },
  {
    status: "PAGO",
    label: "Pago / Liquidado",
    desc: "Pagamento processado com sucesso.",
  },
];

export const SinistroTimeline: React.FC<SinistroTimelineProps> = ({
  statusAtual,
  motivoRejeicao,
}) => {
  const isRejeitado = statusAtual === "REJEITADO";
  const indexAtual = ETAPAS.findIndex((e) => e.status === statusAtual);

  if (isRejeitado) {
    return (
      <div className="p-4 sm:p-5 rounded-(--radius) bg-red-500/5 border border-red-500/20 text-red-700 dark:text-red-400 space-y-1.5 shadow-2xs">
        <div className="flex items-center gap-2.5 font-bold text-sm">
          <div className="w-6 h-6 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <span>Sinistro Rejeitado</span>
        </div>
        <p className="text-xs text-(--muted) pl-8.5 leading-relaxed">
          {motivoRejeicao
            ? `Motivo informado pela regulação: ${motivoRejeicao}`
            : "O sinistro foi indeferido pela regulação técnica da seguradora."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-(--radius) bg-(--surface) border border-(--border) shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-(--accent-ink)">
          Linha do Tempo do Processo
        </h3>
        <span className="text-[11px] text-(--muted) font-medium">
          Status em tempo real
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ETAPAS.map((etapa, idx) => {
          const concluida = indexAtual !== -1 && idx < indexAtual;
          const atual = etapa.status === statusAtual;

          return (
            <div
              key={etapa.status}
              className={`flex flex-col items-center text-center p-3 rounded-lg border transition-all ${
                atual
                  ? "bg-(--accent-soft)/40 border-(--accent) shadow-2xs"
                  : concluida
                  ? "bg-(--surface-2)/40 border-emerald-500/30"
                  : "bg-(--surface-2)/20 border-transparent opacity-60"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  concluida
                    ? "bg-emerald-600 text-white"
                    : atual
                    ? "bg-(--accent) text-white ring-3 ring-(--accent-soft)"
                    : "bg-(--surface-2) text-(--muted) border border-(--border)"
                }`}
              >
                {concluida ? "✓" : idx + 1}
              </div>
              <span
                className={`text-xs font-semibold mt-2 ${
                  atual
                    ? "text-(--accent-ink)"
                    : concluida
                    ? "text-emerald-700"
                    : "text-(--fg)"
                }`}
              >
                {etapa.label}
              </span>
              <span className="text-[11px] text-(--muted) mt-1 leading-tight">
                {etapa.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
