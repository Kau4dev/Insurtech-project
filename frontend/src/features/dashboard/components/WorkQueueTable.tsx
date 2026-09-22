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

export const WorkQueueTable: React.FC<WorkQueueTableProps> = ({
  sinistros,
  isLoading = false,
}) => {
  // Limita estritamente às últimas 6 na fila
  const items: WorkQueueItem[] =
    sinistros && sinistros.length > 0
      ? sinistros.slice(0, 6).map((s, index) => ({
          id: s.id || `sin-${index}`,
          numeroSinistro: s.numeroSinistro || "—",
          numeroApolice: s.numeroApolice,
          tipoSinistro: s.tipoSinistro,
          valorEstimado: s.valorEstimado || 0,
          status: s.status,
          seguradoNome: s.seguradoNome || "—",
        }))
      : [];

  const formatCurrency = (val: number) => {
    return val.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="border border-(--border) bg-(--surface) rounded-2xl p-5 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Cabeçalho do Card no Topo */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[15px] font-semibold text-(--fg) tracking-tight">
            Fila de trabalho
          </h2>
          <span className="text-[12px] text-(--muted)">
            {items.length > 0 ? "Últimos 6 registros" : "Sem pendências"}
          </span>
        </div>
        <Link
          to="/sinistros"
          className="text-[12px] font-medium text-(--accent-ink) hover:underline"
        >
          Ver todos →
        </Link>
      </div>

      {/* Tabela alinhada no Topo, logo abaixo do cabeçalho */}
      <div className="overflow-x-auto -mx-5 flex-1">
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
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-(--muted) text-xs"
                >
                  Nenhum sinistro cadastrado na fila no momento.
                </td>
              </tr>
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

                  {/* 2. Tipo de Evento / Sinistro */}
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

                  {/* 5. Nome do Segurado */}
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
