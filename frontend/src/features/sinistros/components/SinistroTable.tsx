import React from "react";
import {
  Badge,
  TableActions,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "../../../components/ui";
import type { BadgeVariant } from "../../../components/ui/Badge";
import type { StatusSinistro } from "../../../interfaces/enums";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";
import { formatarData, formatarMoeda } from "../../../utils/formatters";

interface SinistroTableProps {
  sinistros: Sinistro[];
  isLoading?: boolean;
  onEditar?: (sinistro: Sinistro) => void;
  onVisualizar?: (sinistro: Sinistro) => void;
}

const COLUNAS = [
  "Número",
  "Segurado",
  "Evento",
  "Ocorrência",
  { label: "Estimado", align: "right" as const },
  "Status",
  "Analista",
  { label: "Ações", align: "right" as const },
];

const getBadgeVariant = (status: StatusSinistro): BadgeVariant => {
  switch (status) {
    case "REGISTRADO":
      return "neutral";
    case "EM_ANALISE":
    case "AGUARDANDO_DOCUMENTOS":
      return "warning";
    case "APROVADO":
      return "success";
    case "PAGO":
      return "info";
    case "REJEITADO":
      return "danger";
    default:
      return "neutral";
  }
};

export const SinistroTable: React.FC<SinistroTableProps> = ({
  sinistros,
  isLoading = false,
  onEditar,
  onVisualizar,
}) => {
  return (
    <TableContainer
      isLoading={isLoading}
      isEmpty={sinistros.length === 0}
      loadingMessage="Carregando sinistros..."
      emptyTitle="Nenhum sinistro encontrado"
      emptyDescription="Não há registros para os filtros selecionados ou ainda não há sinistros cadastrados."
    >
      <TableHeader columns={COLUNAS} />
      <tbody className="divide-y divide-(--border)">
        {sinistros.map((sinistro) => (
          <TableRow key={sinistro.id || sinistro.numeroSinistro}>
            <TableCell className="font-medium text-(--fg)">
              <div className="font-semibold">{sinistro.numeroSinistro}</div>
              {sinistro.apoliceId && (
                <div className="text-xs text-(--muted) font-normal mono">
                  apólice {sinistro.apoliceId.slice(0, 8)}…
                </div>
              )}
            </TableCell>

            <TableCell className="text-(--fg) mono text-xs">
              {sinistro.seguradoId || "-"}
            </TableCell>

            <TableCell className="font-medium text-(--fg) text-xs">
              {sinistro.tipoSinistro}
            </TableCell>

            <TableCell className="text-xs text-(--muted) mono">
              {formatarData(sinistro.dataOcorrencia)}
            </TableCell>

            <TableCell
              align="right"
              className="font-medium text-(--fg) text-xs mono"
            >
              {formatarMoeda(sinistro.valorEstimado)}
            </TableCell>

            <TableCell>
              <Badge variant={getBadgeVariant(sinistro.status)}>
                {sinistro.status}
              </Badge>
            </TableCell>

            <TableCell className="text-xs text-(--muted) mono">
              {sinistro.analistaId
                ? `${sinistro.analistaId.slice(0, 8)}…`
                : "—"}
            </TableCell>

            <TableCell align="right">
              <TableActions
                onVisualizar={
                  onVisualizar ? () => onVisualizar(sinistro) : undefined
                }
                onEditar={onEditar ? () => onEditar(sinistro) : undefined}
                editarTitle="Editar sinistro"
              />
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </TableContainer>
  );
};
