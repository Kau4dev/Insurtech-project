import React, { useState } from "react";
import { Badge, Button, Modal, DetailField, TabsNav, TableContainer, TableHeader } from "../../../components/ui";
import type { Segurado } from "../../../interfaces/segurados/segurado";
import { formatarCpfCnpj, formatarTelefone, formatarCep, formatarMoeda, formatarData } from "../../../utils/formatters";
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
  const [abaAtiva, setAbaAtiva] = useState<Aba>("detalhes");

  const seguradoId = segurado?.id;

  const { data: apolicesData, isLoading: loadingApolices } = useApolices(
    seguradoId ? { seguradoId } : undefined
  );

  const { data: sinistrosData, isLoading: loadingSinistros } = useSinistros(
    seguradoId ? { seguradoId } : undefined
  );

  if (!segurado) return null;

  const isPF = segurado.tipoPessoa === "PF";
  const apolices = apolicesData?.content || [];
  const sinistros = sinistrosData?.content || [];

  const enderecoFormatado = [
    segurado.enderecoLogradouro,
    segurado.enderecoCidade,
    segurado.enderecoUf,
    segurado.enderecoCep ? `CEP: ${formatarCep(segurado.enderecoCep)}` : undefined,
  ].filter(Boolean).join(", ");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={segurado.nomeRazaoSocial}
      description={`Cadastrado como ${isPF ? "Pessoa Física" : "Pessoa Jurídica"}`}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-(--surface-2)/40 p-5 rounded-lg border border-(--border)">
            <DetailField
              label="Tipo de Pessoa"
              value={
                <div className="flex items-center gap-2">
                  <Badge variant={isPF ? "info" : "purple"}>{isPF ? "PF" : "PJ"}</Badge>
                  <span>{isPF ? "Pessoa Física" : "Pessoa Jurídica"}</span>
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
            <DetailField label="Telefone" value={formatarTelefone(segurado.telefone)} />

            {isPF && segurado.dataNascimento && (
              <DetailField label="Data de Nascimento" value={formatarData(segurado.dataNascimento)} />
            )}

            <DetailField
              label="Endereço"
              fullWidth
              value={enderecoFormatado || "Logradouro não informado"}
            />
          </div>
        )}

        {/* Apólices */}
        {abaAtiva === "apolices" && (
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
                <tr key={ap.id || ap.numeroApolice} className="hover:bg-(--surface-2)/40">
                  <td className="py-2.5 px-4 font-semibold text-(--fg)">{ap.numeroApolice}</td>
                  <td className="py-2.5 px-4 text-xs">{ap.tipoSeguro}</td>
                  <td className="py-2.5 px-4 text-right text-xs font-medium">{formatarMoeda(ap.valorSeguro)}</td>
                  <td className="py-2.5 px-4 text-xs text-(--muted)">{formatarData(ap.dataFimVigencia)}</td>
                  <td className="py-2.5 px-4 text-xs font-semibold">{ap.status}</td>
                </tr>
              ))}
            </tbody>
          </TableContainer>
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
                <tr key={st.id || st.numeroSinistro} className="hover:bg-(--surface-2)/40">
                  <td className="py-2.5 px-4 font-semibold text-(--fg)">{st.numeroSinistro}</td>
                  <td className="py-2.5 px-4 text-xs">{st.tipoSinistro}</td>
                  <td className="py-2.5 px-4 text-right text-xs font-medium">{formatarMoeda(st.valorEstimado)}</td>
                  <td className="py-2.5 px-4 text-xs text-(--muted)">{formatarData(st.dataOcorrencia)}</td>
                  <td className="py-2.5 px-4 text-xs font-semibold">{st.status}</td>
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
