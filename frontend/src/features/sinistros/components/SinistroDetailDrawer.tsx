import React, { useState } from "react";
import {
  Badge,
  Button,
  DetailField,
  Modal,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
  TabsNav,
} from "../../../components/ui";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";
import {
  formatarStatusSinistro,
  formatarTipoSinistro,
  getSinistroStatusBadgeVariant,
} from "../../../utils/enumUtils";
import { formatarData, formatarMoeda } from "../../../utils/formatters";
import { useHistoricoSinistro } from "../hooks/useSinistros";

export interface SinistroDetailDrawerProps {
  sinistro: Sinistro | null;
  isOpen: boolean;
  onClose: () => void;
  onAlterarStatus?: (sinistro: Sinistro) => void;
}

type Aba = "detalhes" | "historico";

const COLUNAS_HISTORICO = [
  "Data/Hora",
  "Status Anterior",
  "Status Novo",
  "Observação",
];

export const SinistroDetailDrawer: React.FC<SinistroDetailDrawerProps> = ({
  sinistro,
  isOpen,
  onClose
}) => {
  const [abaAtiva, setAbaAtiva] = useState<Aba>("detalhes");

  const { data: historico = [], isLoading: loadingHistorico } =
    useHistoricoSinistro(sinistro?.id);

  if (!sinistro) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Sinistro Nº ${sinistro.numeroSinistro}`}
      description={`Tipo: ${formatarTipoSinistro(sinistro.tipoSinistro)} | Registrado em ${formatarData(sinistro.dataOcorrencia)}`}
      maxWidthClass="max-w-4xl"
    >
      <div className="space-y-6">
        <TabsNav
          activeTab={abaAtiva}
          onChange={setAbaAtiva}
          tabs={[
            { id: "detalhes", label: "Dados do Sinistro" },
            {
              id: "historico",
              label: "Histórico de Status",
              count: historico.length,
            },
          ]}
        />

        {/* Dados do Sinistro */}
        {abaAtiva === "detalhes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-(--surface-2)/40 p-5 rounded-lg border border-(--border)">
            <DetailField
              label="Número do Sinistro"
              value={
                <span className="font-semibold">{sinistro.numeroSinistro}</span>
              }
            />
            <DetailField
              label="ID da Apólice"
              value={<span className="mono text-xs">{sinistro.apoliceId}</span>}
            />
            <DetailField
              label="ID do Segurado"
              value={
                <span className="mono text-xs">{sinistro.seguradoId}</span>
              }
            />
            <DetailField
              label="ID do Analista"
              value={
                sinistro.analistaId ? (
                  <span className="mono text-xs">{sinistro.analistaId}</span>
                ) : (
                  "Não atribuído"
                )
              }
            />

            <DetailField
              label="Tipo de Sinistro"
              value={formatarTipoSinistro(sinistro.tipoSinistro)}
            />
            <DetailField
              label="Data de Ocorrência"
              value={formatarData(sinistro.dataOcorrencia)}
            />

            <DetailField
              label="Valor Estimado"
              value={
                <span className="font-semibold">
                  {formatarMoeda(sinistro.valorEstimado)}
                </span>
              }
            />
            <DetailField
              label="Valor Aprovado"
              value={
                sinistro.valorAprovado ? (
                  <span className="font-semibold text-emerald-600">
                    {formatarMoeda(sinistro.valorAprovado)}
                  </span>
                ) : (
                  "Aguardando análise"
                )
              }
            />

            <DetailField
              label="Status"
              value={
                <Badge variant={getSinistroStatusBadgeVariant(sinistro.status)}>
                  {formatarStatusSinistro(sinistro.status)}
                </Badge>
              }
            />
            <DetailField
              label="Motivo de Rejeição"
              value={sinistro.motivoRejeicao || "N/A"}
            />

            <DetailField
              label="Descrição do Sinistro"
              fullWidth
              value={sinistro.descricao || "Sem descrição fornecida"}
            />
          </div>
        )}

        {/* Histórico de Status */}
        {abaAtiva === "historico" && (
          <TableContainer
            variant="embedded"
            isLoading={loadingHistorico}
            isEmpty={historico.length === 0}
            loadingMessage="Buscando histórico do sinistro..."
            emptyTitle="Nenhum histórico registrado"
            emptyDescription="Não há transições de status registradas para este sinistro."
          >
            <TableHeader columns={COLUNAS_HISTORICO} />
            <tbody className="divide-y divide-(--border)">
              {historico.map((h, idx) => (
                <TableRow key={`${h.createdAt}-${h.statusNovo}-${idx}`}>
                  <TableCell className="text-xs text-(--muted)">
                    {formatarData(h.createdAt || "")}
                  </TableCell>
                  <TableCell className="uppercase">
                    {h.statusAnterior ? (
                      <Badge
                        variant={getSinistroStatusBadgeVariant(
                          h.statusAnterior,
                        )}
                      >
                        {formatarStatusSinistro(h.statusAnterior)}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="uppercase">
                    <Badge
                      variant={getSinistroStatusBadgeVariant(h.statusNovo)}
                    >
                      {formatarStatusSinistro(h.statusNovo)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-(--fg)">
                    {h.observacao || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </TableContainer>
        )}

        <div className="flex justify-end pt-4 border-t border-(--border)">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
