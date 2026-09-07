import React, { useState } from "react";
import {
  Badge,
  Button,
  DetailField,
  Modal,
  TableContainer,
  TableHeader,
  TabsNav,
} from "../../../components/ui";
import type { Apolice } from "../../../interfaces/apolices/apolice";
import { formatarData, formatarMoeda } from "../../../utils/formatters";
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
  onAlterarStatus,
}) => {
  const [abaAtiva, setAbaAtiva] = useState<Aba>("detalhes");

  const seguradoId = apolice?.seguradoId;

  const { data: sinistrosData, isLoading: loadingSinistros } = useSinistros(
    seguradoId ? { seguradoId } : undefined,
  );

  if (!apolice) return null;

  const sinistros = sinistrosData?.content || [];
  const coberturas = apolice.coberturas || [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ATIVA":
        return "success";
      case "SUSPENSA":
        return "warning";
      case "CANCELADA":
      case "EXPIRADA":
        return "danger";
      default:
        return "info";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apólice Nº ${apolice.numeroApolice}`}
      description={`Tipo: ${apolice.tipoSeguro}`}
      maxWidthClass="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Cabeçalho com Ações Rápidas */}
        <div className="flex items-center justify-between bg-(--surface-2)/40 p-4 rounded-lg border border-(--border)">
          <div className="flex items-center gap-3">
            <span className="text-xs text-(--muted) uppercase tracking-wider font-medium">
              Status Atual:
            </span>
            <Badge variant={getStatusBadgeVariant(apolice.status)}>
              {apolice.status}
            </Badge>
          </div>

          {onAlterarStatus && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onAlterarStatus(apolice)}
            >
              Alterar Status
            </Button>
          )}
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-(--surface-2)/40 p-5 rounded-lg border border-(--border)">
            <DetailField
              label="Número da Apólice"
              value={
                <span className="font-semibold">{apolice.numeroApolice}</span>
              }
            />
            <DetailField
              label="ID do Segurado"
              value={<span className="mono">{apolice.seguradoId}</span>}
            />
            <DetailField label="Tipo de Seguro" value={apolice.tipoSeguro} />
            <DetailField
              label="Status"
              value={
                <Badge variant={getStatusBadgeVariant(apolice.status)}>
                  {apolice.status}
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
        )}

        {/* Coberturas */}
        {abaAtiva === "coberturas" && <CoberturaList coberturas={coberturas} />}

        {/* Sinistros */}
        {abaAtiva === "sinistros" && (
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
                  <td className="py-2.5 px-4 text-xs">{st.tipoSinistro}</td>
                  <td className="py-2.5 px-4 text-right text-xs font-medium">
                    {formatarMoeda(st.valorEstimado)}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-(--muted)">
                    {formatarData(st.dataOcorrencia)}
                  </td>
                  <td className="py-2.5 px-4 text-xs font-semibold">
                    {st.status}
                  </td>
                </tr>
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
