import React from "react";
import { Badge, TableContainer, TableHeader, TableRow, TableCell, TableActions } from "../../../components/ui";
import type { BadgeVariant } from "../../../components/ui/Badge";
import type { Apolice } from "../../../interfaces/apolices/apolice";
import type { StatusApolice } from "../../../interfaces/enums";
import { formatarMoeda, formatarData } from "../../../utils/formatters";

interface ApoliceTableProps {
  apolices: Apolice[];
  isLoading?: boolean;
  onEditar?: (apolice: Apolice) => void;
  onVisualizar?: (apolice: Apolice) => void;
}

const COLUNAS = [
  "Apólice",
  "Ramo",
  "Segurado",
  { label: "Valor segurado", align: "right" as const },
  { label: "Prêmio/ano", align: "right" as const },
  "Vigência até",
  "Status",
  { label: "Ações", align: "right" as const },
];

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

export const ApoliceTable: React.FC<ApoliceTableProps> = ({
  apolices,
  isLoading = false,
  onEditar,
  onVisualizar,
}) => {
  return (
    <TableContainer
      isLoading={isLoading}
      isEmpty={apolices.length === 0}
      loadingMessage="Carregando apólices..."
      emptyTitle="Nenhuma apólice encontrada"
      emptyDescription="Não há registros para os filtros selecionados ou ainda não há apólices cadastradas."
    >
      <TableHeader columns={COLUNAS} />
      <tbody className="divide-y divide-(--border)">
        {apolices.map((apolice) => (
          <TableRow key={apolice.id || apolice.numeroApolice}>
            <TableCell className="font-semibold text-(--fg)">
              {apolice.numeroApolice}
            </TableCell>

            <TableCell className="text-(--fg) mono text-xs">
              {apolice.tipoSeguro}
            </TableCell>

            <TableCell className="text-xs text-(--fg)">
              {apolice.seguradoId || "-"}
            </TableCell>

            <TableCell align="right" className="font-medium text-(--fg) text-xs">
              {formatarMoeda(apolice.valorSeguro)}
            </TableCell>

            <TableCell align="right" className="font-medium text-(--fg) text-xs">
              {formatarMoeda(apolice.valorPremio)}
            </TableCell>

            <TableCell className="text-xs text-(--muted)">
              {formatarData(apolice.dataFimVigencia)}
            </TableCell>

            <TableCell>
              <Badge variant={getBadgeVariant(apolice.status)}>
                {apolice.status}
              </Badge>
            </TableCell>

            <TableCell align="right">
              <TableActions
                onVisualizar={onVisualizar ? () => onVisualizar(apolice) : undefined}
                onEditar={onEditar ? () => onEditar(apolice) : undefined}
                editarTitle="Editar apólice"
              />
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </TableContainer>
  );
};
