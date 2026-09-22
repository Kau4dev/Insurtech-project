import React from "react";
import {
  Badge,
  TableActions,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "../../../components/ui";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";
import {
  formatarStatusSinistro,
  formatarTipoSinistro,
  getSinistroStatusBadgeVariant,
} from "../../../utils/enumUtils";
import { formatarData, formatarMoeda } from "../../../utils/formatters";
import { ApoliceNumero } from "../../apolices/components/ApoliceNumero";
import { SeguradoNome } from "../../segurados/components/SeguradoNome";

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
  { label: "Ações", align: "center" as const },
];

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
                <div className="text-xs text-(--muted) font-normal">
                  <ApoliceNumero apoliceId={sinistro.apoliceId} />
                </div>
              )}
            </TableCell>

            <TableCell className="text-xs text-(--muted) font-normal">
              {sinistro.seguradoId && (
                <SeguradoNome seguradoId={sinistro.seguradoId} />
              )}
            </TableCell>

            <TableCell className="text-(--fg) mono text-xs uppercase">
              {formatarTipoSinistro(sinistro.tipoSinistro)}
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

            <TableCell className="uppercase">
              <Badge variant={getSinistroStatusBadgeVariant(sinistro.status)}>
                {formatarStatusSinistro(sinistro.status)}
              </Badge>
            </TableCell>

            <TableCell className="text-xs text-(--muted) mono">
              {sinistro.analistaId
                ? `${sinistro.analistaId.slice(0, 8)}…`
                : "—"}
            </TableCell>

            <TableCell align="center">
              {(() => {
                const podeEditar = !["APROVADO", "PAGO", "REJEITADO"].includes(
                  sinistro.status,
                );
                return (
                  <TableActions
                    onVisualizar={
                      onVisualizar ? () => onVisualizar(sinistro) : undefined
                    }
                    onEditar={
                      onEditar && podeEditar
                        ? () => onEditar(sinistro)
                        : undefined
                    }
                    editarTitle="Editar sinistro"
                  />
                );
              })()}
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </TableContainer>
  );
};
