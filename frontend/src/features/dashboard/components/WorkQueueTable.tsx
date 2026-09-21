import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge";
import type { StatusSinistro } from "../../../interfaces/enums";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";
import {
  formatarStatusSinistro,
  formatarTipoSinistro,
  getSinistroStatusBadgeVariant,
} from "../../../utils/enumUtils";

export interface WorkQueueItem {
  id?: string;
  numeroSinistro: string;
  numeroApolice?: string;
  tipoSinistro: string;
  valorEstimado: number;
  status: StatusSinistro;
  seguradoNome?: string;
}

export interface WorkQueueTableProps {
  sinistros?: (Sinistro & { numeroApolice?: string; seguradoNome?: string })[];
  isLoading?: boolean;
}

// Itens de demonstração para espelhar perfeitamente o mockup caso a fila esteja vazia
const DEMO_WORK_QUEUE: WorkQueueItem[] = [
  {
    id: "demo-1",
    numeroSinistro: "SIN-2026-0001",
    numeroApolice: "AP-2026-0001",
    tipoSinistro: "COLISAO",
    valorEstimado: 8500,
    status: "APROVADO",
    seguradoNome: "Carlos Eduardo Silva",
  },
  {
    id: "demo-2",
    numeroSinistro: "SIN-2026-0002",
    numeroApolice: "AP-2026-0002",
    tipoSinistro: "INCENDIO",
    valorEstimado: 45000,
    status: "EM_ANALISE",
    seguradoNome: "Tech Solutions Ltda",
  },
  {
    id: "demo-3",
    numeroSinistro: "SIN-2026-0003",
    numeroApolice: "AP-2026-0003",
    tipoSinistro: "ALAGAMENTO",
    valorEstimado: 12500,
    status: "AGUARDANDO_DOCUMENTOS",
    seguradoNome: "Mariana Oliveira Santos",
  },
  {
    id: "demo-4",
    numeroSinistro: "SIN-2026-0004",
    numeroApolice: "AP-2026-0001",
    tipoSinistro: "QUEBRA_DE_VIDRO",
    valorEstimado: 1400,
    status: "PAGO",
    seguradoNome: "Carlos Eduardo Silva",
  },
  {
    id: "demo-5",
    numeroSinistro: "SIN-2026-0005",
    numeroApolice: "AP-2025-0045",
    tipoSinistro: "DANO_A_TERCEIRO",
    valorEstimado: 18000,
    status: "REJEITADO",
    seguradoNome: "Auto Peças & Serviços Silva ME",
  },
];

export const WorkQueueTable: React.FC<WorkQueueTableProps> = ({
  sinistros,
  isLoading = false,
}) => {
  // Mapeia os dados dinâmicos ou usa a lista padrão de demonstração
  const items: WorkQueueItem[] =
    sinistros && sinistros.length > 0
      ? sinistros.slice(0, 5).map((s, index) => ({
          id: s.id || `sin-${index}`,
          numeroSinistro: s.numeroSinistro,
          numeroApolice: s.numeroApolice,
          tipoSinistro: s.tipoSinistro,
          valorEstimado: s.valorEstimado,
          status: s.status,
          seguradoNome: s.seguradoNome || "Segurado",
        }))
      : DEMO_WORK_QUEUE;

  const formatCurrency = (val: number) => {
    return val.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="border border-(--border) bg-(--surface) rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full overflow-hidden">
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[15px] font-semibold text-(--fg) tracking-tight">
            Fila de trabalho
          </h2>
          <span className="text-[12px] text-(--muted)">
            prioridade por antiguidade
          </span>
        </div>
        <Link
          to="/sinistros"
          className="text-[12px] font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          ver todos
        </Link>
      </div>

      {/* Tabela estendendo de ponta a ponta (encostando nas bordas da div) */}
      <div className="overflow-x-auto -mx-5 -mb-5">
        <table className="w-full text-left border-collapse table-fixed min-w-140">
          <colgroup>
            <col className="w-[23%]" />
            <col className="w-[19%]" />
            <col className="w-[17%]" />
            <col className="w-[19%]" />
            <col className="w-[22%]" />
          </colgroup>
          <thead>
            <tr className="border-y border-(--border) bg-(--surface-2) text-[10.5px] font-semibold text-(--faint) uppercase tracking-wider">
              <th className="py-2.5 pl-5 pr-2">Número</th>
              <th className="py-2.5 px-2">Evento</th>
              <th className="py-2.5 px-2">Estimado</th>
              <th className="py-2.5 px-2">Status</th>
              <th className="py-2.5 pl-2 pr-5">Segurado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border)/60 text-[11.5px]">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3 pl-5 pr-2">
                    <div className="h-3.5 w-24 bg-(--surface-2) rounded" />
                  </td>
                  <td className="py-3 px-2">
                    <div className="h-3.5 w-20 bg-(--surface-2) rounded" />
                  </td>
                  <td className="py-3 px-2">
                    <div className="h-3.5 w-16 bg-(--surface-2) rounded" />
                  </td>
                  <td className="py-3 px-2">
                    <div className="h-4.5 w-20 bg-(--surface-2) rounded-full" />
                  </td>
                  <td className="py-3 pl-2 pr-5">
                    <div className="h-3.5 w-24 bg-(--surface-2) rounded" />
                  </td>
                </tr>
              ))
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-(--surface-2)/50 transition-colors group"
                >
                  {/* 1. Número do Sinistro e Apólice */}
                  <td className="py-3 pl-5 pr-2">
                    <div className="font-semibold text-(--fg) tracking-tight text-[12px] whitespace-nowrap truncate">
                      {item.numeroSinistro}
                    </div>
                    {item.numeroApolice && (
                      <div className="text-[10px] text-(--muted) font-mono whitespace-nowrap truncate">
                        {item.numeroApolice}
                      </div>
                    )}
                  </td>

                  {/* 2. Tipo de Evento / Sinistro (sem quebra de linha) */}
                  <td className="py-3 px-2 text-(--fg) whitespace-nowrap truncate">
                    {formatarTipoSinistro(item.tipoSinistro)}
                  </td>

                  {/* 3. Valor Estimado */}
                  <td className="py-3 px-2 font-mono text-(--fg) whitespace-nowrap">
                    {formatCurrency(item.valorEstimado)}
                  </td>

                  {/* 4. Status com Badge Padronizado compacto */}
                  <td className="py-3 px-2 whitespace-nowrap">
                    <Badge
                      variant={getSinistroStatusBadgeVariant(item.status)}
                      className="text-[10.5px] px-2 py-0.5 whitespace-nowrap font-medium"
                    >
                      {item.status === "AGUARDANDO_DOCUMENTOS"
                        ? "Aguardando docs"
                        : formatarStatusSinistro(item.status)}
                    </Badge>
                  </td>

                  {/* 5. Nome do Segurado (sem quebra de linha) */}
                  <td className="py-3 pl-2 pr-5 text-(--muted) group-hover:text-(--fg) transition-colors whitespace-nowrap truncate">
                    {item.seguradoNome}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
