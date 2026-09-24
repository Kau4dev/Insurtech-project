import React from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  TableActions,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "../../../components/ui";
import { useAuth } from "../../../context/useAuth";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";
import {
  formatarStatusSinistro,
  formatarTipoSinistro,
  getSinistroStatusBadgeVariant,
} from "../../../utils/enumUtils";
import { formatarData, formatarMoeda } from "../../../utils/formatters";
import { ApoliceNumero } from "../../apolices/components/ApoliceNumero";
import { SeguradoNome } from "../../segurados/components/SeguradoNome";
import { AnalistaNome } from "./AnalistaNome";

interface SinistroTableProps {
  sinistros: Sinistro[];
  isLoading?: boolean;
  onEditar?: (sinistro: Sinistro) => void;
  onVisualizar?: (sinistro: Sinistro) => void;
  onAtribuir?: (sinistro: Sinistro) => void;
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
  onAtribuir,
}) => {
  const { usuario } = useAuth();
  const isAnalista = usuario?.papel === "ANALISTA";
  const podeGerenciar =
    usuario?.papel === "ANALISTA" ||
    usuario?.papel === "GESTOR" ||
    usuario?.papel === "ADMIN";
  const textoBotaoAtribuir = isAnalista ? "Assumir" : "Atribuir";
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

            <TableCell className="text-xs">
              <AnalistaNome
                analistaId={sinistro.analistaId}
                fallbackText="-------------------"
                showIcon={Boolean(sinistro.analistaId)}
              />
            </TableCell>

            <TableCell align="center">
              {(() => {
                const podeDecidir =
                  podeGerenciar &&
                  (sinistro.status === "EM_ANALISE" ||
                    sinistro.status === "AGUARDANDO_DOCUMENTOS");
                return (
                  <TableActions
                    onVisualizar={
                      onVisualizar ? () => onVisualizar(sinistro) : undefined
                    }
                    onEditar={
                      onEditar && podeDecidir
                        ? () => onEditar(sinistro)
                        : undefined
                    }
                    editarTitle="Decidir sinistro (Aprovar / Rejeitar)"
                  >
                    <Link
                      to={`/sinistros/${sinistro.id}/documentos`}
                      className="p-1.5 rounded hover:bg-(--surface-2) text-(--muted) hover:text-(--accent-ink) transition-colors inline-flex items-center"
                      title="Gerenciar documentos e anexos do sinistro"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </Link>

                    {sinistro.status === "REGISTRADO" &&
                      onAtribuir &&
                      podeGerenciar && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onAtribuir(sinistro)}
                          title={
                            isAnalista
                              ? "Assumir análise deste sinistro"
                              : "Atribuir analista responsável"
                          }
                        >
                          {textoBotaoAtribuir}
                        </Button>
                      )}
                  </TableActions>
                );
              })()}
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </TableContainer>
  );
};
