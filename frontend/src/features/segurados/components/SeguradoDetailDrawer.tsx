import React, { useState } from "react";
import { Badge, Button, Modal, LoadingState, EmptyState } from "../../../components/ui";
import type { Segurado } from "../../../interfaces/segurados/segurado";
import { formatarCpfCnpj, formatarTelefone, formatarCep } from "../../../utils/formatters";
import { useApolices } from "../../apolices/hooks/useApolices";
import { useSinistros } from "../../sinistros/hooks/useSinistros";

export interface SeguradoDetailDrawerProps {
  segurado: Segurado | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SeguradoDetailDrawer: React.FC<SeguradoDetailDrawerProps> = ({
  segurado,
  isOpen,
  onClose,
}) => {
  const [abaAtiva, setAbaAtiva] = useState<"detalhes" | "apolices" | "sinistros">("detalhes");

  const seguradoId = segurado?.id;

  // Orquestração no Frontend: busca apólices e sinistros vinculados ao seguradoId
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

  const formatarMoeda = (val?: number) => {
    if (val === undefined || val === null) return "-";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const formatarData = (dataStr?: string) => {
    if (!dataStr) return "-";
    if (dataStr.includes("-")) {
      const parts = dataStr.split("T")[0].split("-");
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dataStr;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={segurado.nomeRazaoSocial}
      description={`Cadastrado como ${isPF ? "Pessoa Física" : "Pessoa Jurídica"}`}
      maxWidthClass="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Navegação por Abas */}
        <div className="flex items-center gap-2 border-b border-(--border) pb-2">
          <button
            onClick={() => setAbaAtiva("detalhes")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              abaAtiva === "detalhes"
                ? "bg-(--accent) text-white"
                : "text-(--muted) hover:text-(--fg) hover:bg-(--surface-2)"
            }`}
          >
            Informações Cadastrais
          </button>

          <button
            onClick={() => setAbaAtiva("apolices")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              abaAtiva === "apolices"
                ? "bg-(--accent) text-white"
                : "text-(--muted) hover:text-(--fg) hover:bg-(--surface-2)"
            }`}
          >
            Apólices
            <span className="px-2 py-0.5 text-xs rounded-full bg-white/20">
              {apolices.length}
            </span>
          </button>

          <button
            onClick={() => setAbaAtiva("sinistros")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              abaAtiva === "sinistros"
                ? "bg-(--accent) text-white"
                : "text-(--muted) hover:text-(--fg) hover:bg-(--surface-2)"
            }`}
          >
            Sinistros
            <span className="px-2 py-0.5 text-xs rounded-full bg-white/20">
              {sinistros.length}
            </span>
          </button>
        </div>

        {/* Conteúdo da Aba 1: Detalhes Cadastrais */}
        {abaAtiva === "detalhes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-(--surface-2)/40 p-5 rounded-lg border border-(--border)">
            <div>
              <span className="text-xs text-(--muted) uppercase tracking-wider block font-medium mb-1">
                Tipo de Pessoa
              </span>
              <div className="flex items-center gap-2">
                <Badge variant={isPF ? "info" : "purple"}>{isPF ? "PF" : "PJ"}</Badge>
                <span className="text-sm font-medium text-(--fg)">
                  {isPF ? "Pessoa Física" : "Pessoa Jurídica"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-(--muted) uppercase tracking-wider block font-medium mb-1">
                {isPF ? "CPF" : "CNPJ"}
              </span>
              <span className="text-sm font-semibold mono text-(--fg)">
                {formatarCpfCnpj(segurado.cpfCnpj, segurado.tipoPessoa)}
              </span>
            </div>

            <div>
              <span className="text-xs text-(--muted) uppercase tracking-wider block font-medium mb-1">
                E-mail
              </span>
              <span className="text-sm text-(--fg)">{segurado.email}</span>
            </div>

            <div>
              <span className="text-xs text-(--muted) uppercase tracking-wider block font-medium mb-1">
                Telefone
              </span>
              <span className="text-sm text-(--fg)">{formatarTelefone(segurado.telefone)}</span>
            </div>

            {isPF && segurado.dataNascimento && (
              <div>
                <span className="text-xs text-(--muted) uppercase tracking-wider block font-medium mb-1">
                  Data de Nascimento
                </span>
                <span className="text-sm text-(--fg)">{formatarData(segurado.dataNascimento)}</span>
              </div>
            )}

            <div className="md:col-span-2 border-t border-(--border) pt-4 mt-2">
              <span className="text-xs text-(--muted) uppercase tracking-wider block font-medium mb-2">
                Endereço
              </span>
              <p className="text-sm text-(--fg)">
                {segurado.enderecoLogradouro || "Logradouro não informado"}
                {segurado.enderecoCidade ? `, ${segurado.enderecoCidade}` : ""}
                {segurado.enderecoUf ? ` - ${segurado.enderecoUf}` : ""}
                {segurado.enderecoCep ? ` (CEP: ${formatarCep(segurado.enderecoCep)})` : ""}
              </p>
            </div>
          </div>
        )}

        {/* Conteúdo da Aba 2: Apólices (apolices-service) */}
        {abaAtiva === "apolices" && (
          <div>
            {loadingApolices ? (
              <LoadingState message="Buscando apólices do segurado..." />
            ) : apolices.length === 0 ? (
              <EmptyState
                title="Nenhuma apólice vinculada"
                description="Este segurado ainda não possui apólices cadastradas no apolices-service."
              />
            ) : (
              <div className="border border-(--border) rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-(--surface-2) border-b border-(--border) text-xs uppercase text-(--muted)">
                      <th className="py-2.5 px-4">Apólice</th>
                      <th className="py-2.5 px-4">Ramo</th>
                      <th className="py-2.5 px-4 text-right">Valor Segurado</th>
                      <th className="py-2.5 px-4">Vigência até</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--border)">
                    {apolices.map((ap) => (
                      <tr key={ap.id || ap.numeroApolice} className="hover:bg-(--surface-2)/40">
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
                        <td className="py-2.5 px-4 text-xs font-semibold">{ap.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Conteúdo da Aba 3: Sinistros (sinistros-service) */}
        {abaAtiva === "sinistros" && (
          <div>
            {loadingSinistros ? (
              <LoadingState message="Buscando sinistros do segurado..." />
            ) : sinistros.length === 0 ? (
              <EmptyState
                title="Nenhum sinistro registrado"
                description="Este segurado não possui histórico de sinistros no sinistros-service."
              />
            ) : (
              <div className="border border-(--border) rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-(--surface-2) border-b border-(--border) text-xs uppercase text-(--muted)">
                      <th className="py-2.5 px-4">Sinistro</th>
                      <th className="py-2.5 px-4">Tipo</th>
                      <th className="py-2.5 px-4 text-right">Valor Estimado</th>
                      <th className="py-2.5 px-4">Data Ocorrência</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--border)">
                    {sinistros.map((st) => (
                      <tr key={st.id || st.numeroSinistro} className="hover:bg-(--surface-2)/40">
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
                        <td className="py-2.5 px-4 text-xs font-semibold">{st.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Rodapé de Ações */}
        <div className="flex justify-end pt-4 border-t border-(--border)">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
