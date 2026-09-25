import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  CopyableId,
  DetailField,
  Modal,
  TableContainer,
  TableHeader,
  TabsNav,
} from "../../../components/ui";
import type { Apolice } from "../../../interfaces/apolices/apolice";
import {
  formatarStatusApolice,
  formatarStatusSinistro,
  formatarTipoSeguro,
  formatarTipoSinistro,
  getApoliceStatusBadgeVariant,
  getSinistroStatusBadgeVariant,
} from "../../../utils/enumUtils";
import { formatarData, formatarMoeda } from "../../../utils/formatters";
import { SeguradoNome } from "../../segurados/components/SeguradoNome";
import { useSinistros } from "../../sinistros/hooks/useSinistros";
import { CoberturaList } from "./CoberturaList";

export interface ApoliceDetailDrawerProps {
  apolice: Apolice | null;
  isOpen: boolean;
  onClose: () => void;
  onAlterarStatus?: (apolice: Apolice) => void;
}

type Aba = "detalhes" | "coberturas" | "sinistros";

const COLUNAS_SINISTROS = [
  "Sinistro",
  "Tipo",
  { label: "Valor Estimado", align: "right" as const },
  "Data Ocorrência",
  "Status",
];

export const ApoliceDetailDrawer: React.FC<ApoliceDetailDrawerProps> = ({
  apolice,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState<Aba>("detalhes");

  const seguradoId = apolice?.seguradoId;

  const { data: sinistrosData, isLoading: loadingSinistros } = useSinistros(
    seguradoId ? { seguradoId } : undefined,
  );

  if (!apolice) return null;

  const sinistros = sinistrosData?.content || [];
  const coberturas = apolice.coberturas || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apólice Nº ${apolice.numeroApolice}`}
      description={`Tipo: ${apolice.tipoSeguro}`}
      maxWidthClass="max-w-4xl"
    >
      <div className="space-y-6">
        <TabsNav
          activeTab={abaAtiva}
          onChange={setAbaAtiva}
          tabs={[
            { id: "detalhes", label: "Dados da Apólice" },
            { id: "coberturas", label: "Coberturas", count: coberturas.length },
            {
              id: "sinistros",
              label: "Sinistros Vinculados",
              count: sinistros.length,
            },
          ]}
        />

        {/* Dados da Apólice */}
        {abaAtiva === "detalhes" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-(--surface-2)/60 border border-(--border) text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="text-(--muted)">ID da Apólice:</span>
                <CopyableId id={apolice.id} truncate />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-(--muted)">ID do Segurado:</span>
                <CopyableId id={apolice.seguradoId} truncate />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-(--surface-2)/40 p-5 rounded-lg border border-(--border)">
              <DetailField
                label="Número da Apólice"
                value={
                  <span className="font-semibold">{apolice.numeroApolice}</span>
                }
              />
              <DetailField
                label="Segurado Vinculado"
                value={
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-(--fg)">
                      <SeguradoNome seguradoId={apolice.seguradoId} />
                    </span>
                  </div>
                }
              />
              <DetailField
                label="Tipo de Seguro"
                value={formatarTipoSeguro(apolice.tipoSeguro)}
              />
              <DetailField
                label="Status"
                value={
                  <Badge className="uppercase" variant={getApoliceStatusBadgeVariant(apolice.status)}>
                    {formatarStatusApolice(apolice.status)}
                  </Badge>
                }
              />
              <DetailField
                label="Valor do Seguro (LMI)"
                value={
                  <span className="font-semibold">
                    {formatarMoeda(apolice.valorSeguro)}
                  </span>
                }
              />
              <DetailField
                label="Valor do Prêmio"
                value={
                  <span className="font-semibold">
                    {formatarMoeda(apolice.valorPremio)}
                  </span>
                }
              />
              <DetailField
                label="Início da Vigência"
                value={formatarData(apolice.dataInicioVigencia)}
              />
              <DetailField
                label="Fim da Vigência"
                value={formatarData(apolice.dataFimVigencia)}
              />
            </div>
          </div>
        )}

        {/* Coberturas */}
        {abaAtiva === "coberturas" && <CoberturaList coberturas={coberturas} />}

        {/* Sinistros */}
        {abaAtiva === "sinistros" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-(--muted) uppercase tracking-wider">
                Sinistros ({sinistros.length})
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  navigate(
                    `/sinistros?novo=true&apoliceId=${apolice.id}&seguradoId=${apolice.seguradoId}`,
                  );
                }}
                icon={
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                }
              >
                Novo Sinistro
              </Button>
            </div>

            <TableContainer
              variant="embedded"
              isLoading={loadingSinistros}
              isEmpty={sinistros.length === 0}
              loadingMessage="Buscando sinistros vinculados..."
              emptyTitle="Nenhum sinistro vinculado"
              emptyDescription="Não existem sinistros registrados para o segurado desta apólice."
            >
              <TableHeader columns={COLUNAS_SINISTROS} />
              <tbody className="divide-y divide-(--border)">
                {sinistros.map((st) => (
                  <tr
                    key={st.id || st.numeroSinistro}
                    className="hover:bg-(--surface-2)/40"
                  >
                    <td className="py-2.5 px-4 font-semibold text-(--fg)">
                      {st.numeroSinistro}
                    </td>
                    <td className="py-2.5 px-4 text-(--fg) text-xs font-medium uppercase">
                      {formatarTipoSinistro(st.tipoSinistro)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-xs font-medium">
                      {formatarMoeda(st.valorEstimado)}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-(--muted)">
                      {formatarData(st.dataOcorrencia)}
                    </td>
                    <td className="py-2.5 px-4 text-xs font-semibold uppercase">
                      <Badge variant={getSinistroStatusBadgeVariant(st.status)}>
                        {formatarStatusSinistro(st.status)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableContainer>
          </div>
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
