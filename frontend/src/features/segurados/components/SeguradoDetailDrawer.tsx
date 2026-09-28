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
import type { Segurado } from "../../../interfaces/segurados/segurado";
import {
  formatarTipoPessoa,
  formatarTipoSinistro,
  formatarStatusSinistro,
  getApoliceStatusBadgeVariant,
  getPessoaTipoBadgeVariant,
  getSinistroStatusBadgeVariant,
} from "../../../utils/enumUtils";
import {
  formatarCep,
  formatarCpfCnpj,
  formatarData,
  formatarMoeda,
  formatarTelefone,
} from "../../../utils/formatters";
import { useApolices } from "../../apolices/hooks/useApolices";
import { useSinistros } from "../../sinistros/hooks/useSinistros";

export interface SeguradoDetailDrawerProps {
  segurado: Segurado | null;
  isOpen: boolean;
  onClose: () => void;
}


type Aba = "detalhes" | "apolices" | "sinistros";

const COLUNAS_APOLICES = [
  "Apólice",
  "Ramo",
  { label: "Valor Segurado", align: "right" as const },
  "Vigência até",
  "Status",
];

const COLUNAS_SINISTROS = [
  "Sinistro",
  "Tipo",
  { label: "Valor Estimado", align: "right" as const },
  "Data Ocorrência",
  "Status",
];

export const SeguradoDetailDrawer: React.FC<SeguradoDetailDrawerProps> = ({
  segurado,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState<Aba>("detalhes");

  const seguradoId = segurado?.id;

  const { data: apolicesData, isLoading: loadingApolices } = useApolices(
    seguradoId ? { seguradoId } : undefined,
  );

  const { data: sinistrosData, isLoading: loadingSinistros } = useSinistros(
    seguradoId ? { seguradoId } : undefined,
  );

  if (!segurado) return null;

  const isPF = segurado.tipoPessoa === "PF";
  const apolices = apolicesData?.content || [];
  const sinistros = sinistrosData?.content || [];

  const enderecoFormatado = [
    segurado.enderecoLogradouro,
    segurado.enderecoCidade,
    segurado.enderecoUf,
    segurado.enderecoCep
      ? `CEP: ${formatarCep(segurado.enderecoCep)}`
      : undefined,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={segurado.nomeRazaoSocial}
      description={`Cadastrado como ${formatarTipoPessoa(segurado.tipoPessoa)}`}
      maxWidthClass="max-w-4xl"
    >
      <div className="space-y-6">
        <TabsNav
          activeTab={abaAtiva}
          onChange={setAbaAtiva}
          tabs={[
            { id: "detalhes", label: "Informações Cadastrais" },
            { id: "apolices", label: "Apólices", count: apolices.length },
            { id: "sinistros", label: "Sinistros", count: sinistros.length },
          ]}
        />

        {/* Detalhes Cadastrais */}
        {abaAtiva === "detalhes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-(--surface-2)/60 border border-(--border) text-xs">
              <span className="text-(--muted)">ID do Segurado no Sistema:</span>
              <CopyableId id={segurado.id} truncate />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-(--surface-2)/40 p-5 rounded-lg border border-(--border)">
              <DetailField
                label="Tipo de Pessoa"
                value={
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getPessoaTipoBadgeVariant(segurado.tipoPessoa)}
                    >
                      {segurado.tipoPessoa}
                    </Badge>
                    <span>{formatarTipoPessoa(segurado.tipoPessoa)}</span>
                  </div>
                }
              />

              <DetailField
                label={isPF ? "CPF" : "CNPJ"}
                value={
                  <span className="mono font-semibold">
                    {formatarCpfCnpj(segurado.cpfCnpj, segurado.tipoPessoa)}
                  </span>
                }
              />

              <DetailField label="E-mail" value={segurado.email} />
              <DetailField
                label="Telefone"
                value={formatarTelefone(segurado.telefone)}
              />

              {isPF && segurado.dataNascimento && (
                <DetailField
                  label="Data de Nascimento"
                  value={formatarData(segurado.dataNascimento)}
                />
              )}

              <DetailField
                label="Endereço"
                fullWidth
                value={enderecoFormatado || "Logradouro não informado"}
              />
            </div>
          </div>
        )}

        {/* Apólices */}
        {abaAtiva === "apolices" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-(--muted) uppercase tracking-wider">
                Apólices Vinculadas ({apolices.length})
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  navigate(`/apolices?novo=true&seguradoId=${segurado.id}`);
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
                Nova Apólice
              </Button>
            </div>

            <TableContainer
              variant="embedded"
              isLoading={loadingApolices}
              isEmpty={apolices.length === 0}
              loadingMessage="Buscando apólices do segurado..."
              emptyTitle="Nenhuma apólice vinculada"
              emptyDescription="Este segurado ainda não possui apólices cadastradas."
            >
              <TableHeader columns={COLUNAS_APOLICES} />
              <tbody className="divide-y divide-(--border)">
                {apolices.map((ap) => (
                  <tr
                    key={ap.id || ap.numeroApolice}
                    className="hover:bg-(--surface-2)/40"
                  >
                    <td className="py-2.5 px-4 font-semibold text-(--fg)">
                      {ap.numeroApolice}
                    </td>
                    <td className="py-2.5 px-4 text-xs">{ap.tipoSeguro}</td>
                    <td className="py-2.5 px-4 text-right text-xs font-medium">
                      {formatarMoeda(ap.valorSeguro)}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-(--muted)">
                      {formatarData(ap.dataFimVigencia)}
                    </td>
                    <td className="py-2.5 px-4 text-xs font-semibold">
                      <Badge variant={getApoliceStatusBadgeVariant(ap.status)}>
                        {ap.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableContainer>
          </div>
        )}

        {/* Sinistros */}
        {abaAtiva === "sinistros" && (
          <TableContainer
            variant="embedded"
            isLoading={loadingSinistros}
            isEmpty={sinistros.length === 0}
            loadingMessage="Buscando sinistros do segurado..."
            emptyTitle="Nenhum sinistro registrado"
            emptyDescription="Este segurado não possui histórico de sinistros."
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
                  <td className="py-2.5 px-4 text-xs uppercase">
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
