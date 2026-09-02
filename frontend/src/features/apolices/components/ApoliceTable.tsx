import React from "react";
import { Badge, Button, EmptyState, LoadingState } from "../../../components/ui";
import type { BadgeVariant } from "../../../components/ui/Badge";
import type { Apolice } from "../../../interfaces/apolices/apolice";
import type { StatusApolice } from "../../../interfaces/enums";

interface ApoliceTableProps {
  apolices: Apolice[];
  isLoading?: boolean;
  onEditar?: (apolice: Apolice) => void;
  onVisualizar?: (apolice: Apolice) => void;
}

const getBadgeVariant = (status: StatusApolice): BadgeVariant => {
  switch (status) {
    case "ATIVA":
      return "success";
    case "SUSPENSA":
      return "warning";
    case "CANCELADA":
      return "danger";
    case "EXPIRADA":
      return "neutral";
    default:
      return "neutral";
  }
};

const formatarMoeda = (valor?: number): string => {
  if (valor === undefined || valor === null) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
};

const formatarData = (dataStr?: string): string => {
  if (!dataStr) return "-";
  if (dataStr.includes("-")) {
    const parts = dataStr.split("T")[0].split("-");
    if (parts.length === 3) {
      const [ano, mes, dia] = parts;
      return `${dia}/${mes}/${ano}`;
    }
  }
  return dataStr;
};

export const ApoliceTable: React.FC<ApoliceTableProps> = ({
  apolices,
  isLoading = false,
  onEditar,
  onVisualizar,
}) => {
  if (isLoading) {
    return <LoadingState message="Carregando apólices..." />;
  }

  if (apolices.length === 0) {
    return (
      <EmptyState
        title="Nenhuma apólice encontrada"
        description="Não há registros para os filtros selecionados ou ainda não há apólices cadastradas."
      />
    );
  }

  return (
    <div className="w-full overflow-hidden bg-(--surface) border border-(--border) rounded-(--radius) shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-(--border) bg-(--surface-2)/60 text-(--muted) font-medium text-xs tracking-wider uppercase">
              <th className="py-3.5 px-4">Apólice</th>
              <th className="py-3.5 px-4">Ramo</th>
              <th className="py-3.5 px-4">Segurado</th>
              <th className="py-3.5 px-4 text-right">Valor segurado</th>
              <th className="py-3.5 px-4 text-right">Prêmio/ano</th>
              <th className="py-3.5 px-4">Vigência até</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border)">
            {apolices.map((apolice) => {
              return (
                <tr
                  key={apolice.id || apolice.numeroApolice}
                  className="hover:bg-(--surface-2)/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-(--fg)">
                    {apolice.numeroApolice}
                  </td>

                  <td className="py-3.5 px-4 text-(--fg) mono text-xs">
                    {apolice.tipoSeguro}
                  </td>

                  <td className="py-3.5 px-4 text-xs text-(--fg)">
                    {apolice.seguradoId || "-"}
                  </td>

                  <td className="py-3.5 px-4 font-medium text-(--fg) text-xs text-right">
                    {formatarMoeda(apolice.valorSeguro)}
                  </td>

                  <td className="py-3.5 px-4 font-medium text-(--fg) text-xs text-right">
                    {formatarMoeda(apolice.valorPremio)}
                  </td>

                  <td className="py-3.5 px-4 text-xs text-(--muted)">
                    {formatarData(apolice.dataFimVigencia)}
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={getBadgeVariant(apolice.status)}>
                      {apolice.status}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {onVisualizar && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onVisualizar(apolice)}
                          title="Visualizar detalhes"
                        >
                          Ver
                        </Button>
                      )}
                      {onEditar && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onEditar(apolice)}
                          title="Editar apólice"
                        >
                          Editar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
