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
import { SeguradoNome } from "../../segurados/components/SeguradoNome";
import { ApoliceNumero } from "../../apolices/components/ApoliceNumero";

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

const tipoSinistroOptions = [
  { value: "COLISAO", label: "COLISÃO" },
  { value: "ROUBO_FURTO", label: "ROUBO/FURTO" },
  { value: "INCENDIO", label: "INCÊNDIO" },
  { value: "DANO_A_TERCEIRO", label: "DANO A TERCEIROS" },
  { value: "ALAGAMENTO", label: "ALAGAMENTO" },
  { value: "QUEBRA_DE_VIDRO", label: "QUEBRA DE VIDRO" },
  { value: "OUTROS", label: "OUTROS" },
];

const statusOptions = [
  { value: "REGISTRADO", label: "REGISTRADO" },
  { value: "EM_ANALISE", label: "EM ANÁLISE" },
  { value: "AGUARDANDO_DOCUMENTOS", label: "AGUARDANDO DOCUMENTOS" },
  { value: "APROVADO", label: "APROVADO" },
  { value: "REJEITADO", label: "REJEITADO" },
  { value: "PAGO", label: "PAGO" },
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
                <div className="text-xs text-(--muted) font-normal">
                  <ApoliceNumero apoliceId={sinistro.apoliceId} /> 
                </div>
              )}
            </TableCell>

            <TableCell className="text-xs text-(--muted) font-normal">
               {sinistro.seguradoId && <SeguradoNome seguradoId={sinistro.seguradoId} />}
            </TableCell>

            <TableCell className="text-(--fg) mono text-xs">
              {tipoSinistroOptions.find((o) => o.value === sinistro.tipoSinistro)?.label || sinistro.tipoSinistro}
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
                {statusOptions.find((o) => o.value === sinistro.status)?.label || sinistro.status}
              </Badge>
            </TableCell>

            <TableCell className="text-xs text-(--muted) mono">
              {sinistro.analistaId
                ? `${sinistro.analistaId.slice(0, 8)}…`
                : "—"}
            </TableCell>

            <TableCell align="center">
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
