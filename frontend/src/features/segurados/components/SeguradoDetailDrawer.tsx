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
  ToastNotification,
} from "../../../components/ui";
import { useAuth } from "../../../context/useAuth";
import {
  useInativarUsuario,
  useReativarUsuario,
  useUsuarioPorId,
} from "../../auth/hooks/useUsuarios";
import type { Segurado } from "../../../interfaces/segurados/segurado";
import { apiParaEndereco } from "../../../interfaces/segurados/enderecoMapper";
import {
  formatarTipoPessoa,
  formatarTipoSinistro,
  formatarStatusSinistro,
  getApoliceStatusBadgeVariant,
  getPessoaTipoBadgeVariant,
  getSinistroStatusBadgeVariant,
} from "../../../utils/enumUtils";
import { extrairMensagemErro } from "../../../utils/errorUtils";
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
  const { usuario: usuarioLogado } = useAuth();
  const podeGerenciarAcesso =
    usuarioLogado?.papel === "ADMIN" || usuarioLogado?.papel === "GESTOR";

  const [abaAtiva, setAbaAtiva] = useState<Aba>("detalhes");
  const [confirmarInativarAberto, setConfirmarInativarAberto] = useState(false);
  const [toastInfo, setToastInfo] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
    variant: "success" | "info" | "warning" | "error";
  } | null>(null);

  const seguradoId = segurado?.id;

  const { data: apolicesData, isLoading: loadingApolices } = useApolices(
    seguradoId ? { seguradoId } : undefined,
  );

  const { data: sinistrosData, isLoading: loadingSinistros } = useSinistros(
    seguradoId ? { seguradoId } : undefined,
  );

  const {
    data: usuarioPortal,
    isLoading: loadingUsuarioPortal,
    refetch: refetchUsuario,
  } = useUsuarioPorId(segurado?.usuarioId);

  const inativarMutation = useInativarUsuario();
  const reativarMutation = useReativarUsuario();

  if (!segurado) return null;

  const isPF = segurado.tipoPessoa === "PF";
  const apolices = apolicesData?.content || [];
  const sinistros = sinistrosData?.content || [];

  const endereco = apiParaEndereco(
    segurado.enderecoLogradouro,
    segurado.enderecoCidade,
    segurado.enderecoUf,
    segurado.enderecoCep,
  );

  const temEndereco = Boolean(
    endereco.rua ||
      endereco.numero ||
      endereco.bairro ||
      endereco.cidade ||
      endereco.uf ||
      endereco.cep ||
      segurado.enderecoLogradouro,
  );

  const handleInativarAcessoPortal = async () => {
    if (!segurado.usuarioId) return;
    try {
      await inativarMutation.mutateAsync(segurado.usuarioId);
      await refetchUsuario();
      setConfirmarInativarAberto(false);
      setToastInfo({
        isOpen: true,
        title: "Acesso inativado",
        message: `O acesso de ${segurado.nomeRazaoSocial} ao Portal do Segurado foi suspenso.`,
        variant: "warning",
      });
    } catch (err) {
      setToastInfo({
        isOpen: true,
        title: "Erro ao inativar acesso",
        message: extrairMensagemErro(err),
        variant: "error",
      });
    }
  };

  const handleReativarAcessoPortal = async () => {
    if (!segurado.usuarioId) return;
    try {
      await reativarMutation.mutateAsync(segurado.usuarioId);
      await refetchUsuario();
      setToastInfo({
        isOpen: true,
        title: "Acesso reativado",
        message: `O acesso de ${segurado.nomeRazaoSocial} ao Portal do Segurado foi restaurado.`,
        variant: "success",
      });
    } catch (err) {
      setToastInfo({
        isOpen: true,
        title: "Erro ao reativar acesso",
        message: extrairMensagemErro(err),
        variant: "error",
      });
    }
  };

  return (
    <>
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

            {/* Acesso e Credenciais do Portal do Segurado */}
            <div className="bg-(--surface-2)/40 p-4 sm:p-5 rounded-lg border border-(--border) space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-(--muted) uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-(--accent-ink)"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Acesso ao Portal do Segurado
                    </span>
                    {segurado.usuarioId ? (
                      loadingUsuarioPortal ? (
                        <span className="text-xs text-(--muted)">
                          Verificando status...
                        </span>
                      ) : (
                        <Badge
                          variant={
                            usuarioPortal?.ativo !== false
                              ? "success"
                              : "danger"
                          }
                        >
                          {usuarioPortal?.ativo !== false
                            ? "Acesso Ativo"
                            : "Acesso Inativo"}
                        </Badge>
                      )
                    ) : (
                      <Badge variant="neutral">Sem Login Vinculado</Badge>
                    )}
                  </div>
                  <p className="text-xs text-(--muted) mt-1">
                    {segurado.usuarioId
                      ? "Credenciais do cliente para consulta de apólices e acionamento de sinistros online."
                      : "Este segurado ainda não possui um login cadastrado no Portal do Segurado."}
                  </p>
                </div>

                {/* Ações de Gestão de Acesso */}
                {segurado.usuarioId &&
                  podeGerenciarAcesso &&
                  !loadingUsuarioPortal && (
                    <div className="shrink-0">
                      {usuarioPortal?.ativo !== false ? (
                        <button
                          type="button"
                          disabled={inativarMutation.isPending}
                          onClick={() => setConfirmarInativarAberto(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/5 hover:bg-red-500/10 active:bg-red-500/15 border border-red-500/20 hover:border-red-500/30 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                          title="Suspender acesso do segurado ao portal"
                        >
                          <svg
                            className="w-3.5 h-3.5 text-red-500 shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </svg>
                          <span>Inativar Acesso ao Portal</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={reativarMutation.isPending}
                          onClick={handleReativarAcessoPortal}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-(--accent-ink) bg-(--accent-soft)/40 hover:bg-(--accent-soft) active:bg-(--accent-soft)/80 border border-(--accent)/30 hover:border-(--accent) transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                          title="Restaurar acesso do segurado ao portal"
                        >
                          <svg
                            className="w-3.5 h-3.5 text-(--accent-ink) shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          <span>Reativar Acesso ao Portal</span>
                        </button>
                      )}
                    </div>
                  )}
              </div>

              {segurado.usuarioId && (
                <div className="flex flex-wrap items-center gap-4 pt-2.5 border-t border-(--border)/60 text-xs">
                  <div>
                    <span className="text-(--muted) mr-1.5">
                      Login de Acesso:
                    </span>
                    <span className="font-mono font-medium text-(--fg)">
                      {usuarioPortal?.email || segurado.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-(--muted) mr-1.5">ID da Conta:</span>
                    <span className="font-mono text-(--muted)">
                      {segurado.usuarioId}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Dados Cadastrais e Contato */}
            <div className="bg-(--surface-2)/40 p-5 rounded-lg border border-(--border) space-y-4">
              <h4 className="text-xs font-semibold text-(--muted) uppercase tracking-wider">
                Dados Principais e Contato
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

                {isPF && segurado.dataNascimento && (
                  <DetailField
                    label="Data de Nascimento"
                    value={formatarData(segurado.dataNascimento)}
                  />
                )}

                <DetailField label="E-mail" value={segurado.email} />

                <DetailField
                  label="Telefone"
                  value={formatarTelefone(segurado.telefone)}
                />
              </div>
            </div>

            {/* Endereço Estruturado */}
            <div className="bg-(--surface-2)/40 p-5 rounded-lg border border-(--border) space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-(--muted) uppercase tracking-wider flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-(--muted)"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Endereço
                </h4>
                {endereco.cep && (
                  <span className="mono text-xs text-(--muted) px-2 py-0.5 rounded bg-(--surface) border border-(--border)">
                    CEP: {formatarCep(endereco.cep)}
                  </span>
                )}
              </div>

              {temEndereco ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailField
                    label="Logradouro / Rua"
                    value={endereco.rua || "-"}
                    className="sm:col-span-2"
                  />
                  <DetailField
                    label="Número"
                    value={endereco.numero || "S/N"}
                  />
                  <DetailField
                    label="Bairro"
                    value={endereco.bairro || "-"}
                  />
                  <DetailField
                    label="Complemento"
                    value={endereco.complemento || "-"}
                  />
                  <DetailField
                    label="Cidade / UF"
                    value={
                      endereco.cidade
                        ? `${endereco.cidade}${endereco.uf ? ` - ${endereco.uf}` : ""}`
                        : endereco.uf || "-"
                    }
                  />
                </div>
              ) : (
                <span className="text-sm text-(--muted) italic">
                  Endereço não informado.
                </span>
              )}
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

    {/* Modal de confirmação de inativação do acesso do segurado */}
    {confirmarInativarAberto && (
      <Modal
        isOpen={true}
        onClose={() => setConfirmarInativarAberto(false)}
        title="Inativar Acesso ao Portal do Segurado"
        description="A suspensão do acesso bloqueará imediatamente logins do cliente no Portal do Segurado."
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-xs text-(--fg) space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-red-600 dark:text-red-400">
              <svg
                className="w-4 h-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>Confirmação de suspensão</span>
            </div>
            <p className="text-(--muted) leading-relaxed">
              Deseja realmente inativar o acesso de{" "}
              <strong className="text-(--fg)">
                {segurado.nomeRazaoSocial}
              </strong>
              ? O segurado não conseguirá mais consultar apólices ou abrir sinistros online.
            </p>
            <div className="p-2.5 rounded bg-(--surface) border border-(--border) text-[11px] font-mono text-(--muted) space-y-1">
              <div>
                E-mail:{" "}
                <span className="text-(--fg) font-semibold">
                  {usuarioPortal?.email || segurado.email}
                </span>
              </div>
              <div>
                CPF/CNPJ:{" "}
                <span className="text-(--fg) font-semibold">
                  {formatarCpfCnpj(segurado.cpfCnpj, segurado.tipoPessoa)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-(--border)">
            <Button
              variant="secondary"
              onClick={() => setConfirmarInativarAberto(false)}
              disabled={inativarMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleInativarAcessoPortal}
              disabled={inativarMutation.isPending}
            >
              {inativarMutation.isPending
                ? "Inativando..."
                : "Confirmar Inativação"}
            </Button>
          </div>
        </div>
      </Modal>
    )}

    {toastInfo && (
      <ToastNotification
        isOpen={toastInfo.isOpen}
        title={toastInfo.title}
        message={toastInfo.message}
        variant={toastInfo.variant}
        onClose={() => setToastInfo(null)}
      />
    )}
  </>
  );
};
