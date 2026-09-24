import React from "react";
import {
  Badge,
  TableActions,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "../../../components/ui";
import type { Apolice } from "../../../interfaces/apolices/apolice";
import { getApoliceStatusBadgeVariant } from "../../../utils/enumUtils";
import { formatarData, formatarMoeda } from "../../../utils/formatters";
import { SeguradoNome } from "../../segurados/components/SeguradoNome";

interface ApoliceTableProps {
  apolices: Apolice[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onEditar?: (apolice: Apolice) => void;
  onVisualizar?: (apolice: Apolice) => void;
}

const COLUNAS = [
  "Número",
  "Ramo",
  "Segurado",
  { label: "Valor segurado", align: "right" as const },
  { label: "Prêmio/ano", align: "right" as const },
  "Vigência até",
  "Status",
  { label: "Ações", align: "center" as const },
];

export const ApoliceTable: React.FC<ApoliceTableProps> = ({
  apolices,
  isLoading = false,
  isError = false,
  onRetry,
  onEditar,
  onVisualizar,
}) => {
  return (
    <TableContainer
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
      isEmpty={apolices.length === 0}
      loadingMessage="Carregando apólices..."
      errorMessage="Ocorreu um erro ao carregar as apólices. Verifique se o backend está ativo."
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

            <TableCell className="text-xs text-(--muted) font-medium">
              <SeguradoNome seguradoId={apolice.seguradoId} />
            </TableCell>

            <TableCell align="right" className="font-medium text-(--fg) ">
              {formatarMoeda(apolice.valorSeguro)}
            </TableCell>

            <TableCell
              align="right"
              className="font-medium text-(--fg) text-xs"
            >
              {formatarMoeda(apolice.valorPremio)}
            </TableCell>

            <TableCell className="text-xs text-(--muted)">
              {formatarData(apolice.dataFimVigencia)}
            </TableCell>

            <TableCell>
              <Badge variant={getApoliceStatusBadgeVariant(apolice.status)}>
                {apolice.status}
              </Badge>
            </TableCell>

            <TableCell align="center">
              <TableActions
                onVisualizar={
                  onVisualizar ? () => onVisualizar(apolice) : undefined
                }
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
