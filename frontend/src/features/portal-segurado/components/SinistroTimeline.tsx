import React from "react";
import type { StatusSinistro } from "../../../interfaces/enums";

interface SinistroTimelineProps {
  statusAtual: StatusSinistro | string;
  motivoRejeicao?: string;
}

const ETAPAS: { status: StatusSinistro; label: string; desc: string }[] = [
  { status: "REGISTRADO", label: "Registrado", desc: "Sinistro recebido com sucesso." },
  { status: "EM_ANALISE", label: "Em Análise", desc: "Analista técnico avaliando." },
  { status: "AGUARDANDO_DOCUMENTOS", label: "Pendente de Documentos", desc: "Documentos complementares solicitados." },
  { status: "APROVADO", label: "Aprovado", desc: "Aprovado para indenização." },
  { status: "PAGO", label: "Pago / Liquidado", desc: "Pagamento processado com sucesso." },
];

export const SinistroTimeline: React.FC<SinistroTimelineProps> = ({ statusAtual, motivoRejeicao }) => {
  const isRejeitado = statusAtual === "REJEITADO";
  const indexAtual = ETAPAS.findIndex((e) => e.status === statusAtual);

  if (isRejeitado) {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <span>❌</span>
          <span>Sinistro Rejeitado</span>
        </div>
        <p className="text-xs text-(--muted) pl-6">
          {motivoRejeicao
            ? `Motivo informado pela regulação: ${motivoRejeicao}`
            : "O sinistro foi indeferido pela regulação técnica da seguradora."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl bg-(--surface) border border-(--border)">
      <h3 className="text-xs font-mono uppercase tracking-wider text-(--muted) mb-4">
        Linha do Tempo do Processo
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {ETAPAS.map((etapa, idx) => {
          const concluida = indexAtual !== -1 && idx < indexAtual;
          const atual = etapa.status === statusAtual;

          return (
            <div
              key={etapa.status}
              className={`flex flex-col items-center text-center p-3 rounded-lg border transition-all ${
                atual
                  ? "bg-(--accent-soft)/40 border-(--accent) shadow-xs"
                  : concluida
                  ? "bg-(--surface-2)/40 border-emerald-500/30"
                  : "bg-(--surface-2)/20 border-transparent opacity-60"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  concluida
                    ? "bg-emerald-500 text-white"
                    : atual
                    ? "bg-(--accent) text-white ring-3 ring-(--accent-soft)"
                    : "bg-(--surface-2) text-(--muted)"
                }`}
              >
                {concluida ? "✓" : idx + 1}
              </div>
              <span
                className={`text-xs font-semibold mt-2 ${
                  atual ? "text-(--accent)" : concluida ? "text-emerald-600" : "text-(--fg)"
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

