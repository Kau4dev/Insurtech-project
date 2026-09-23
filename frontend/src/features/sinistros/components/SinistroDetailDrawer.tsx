import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  CopyableId,
  DetailField,
  Modal,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
  TabsNav,
} from "../../../components/ui";
import { useAuth } from "../../../context/useAuth";
import type { DocumentoSinistro } from "../../../interfaces/sinistros/documentoSinistro";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";
import {
  formatarStatusSinistro,
  formatarTipoDocumento,
  formatarTipoSinistro,
  getSinistroStatusBadgeVariant,
} from "../../../utils/enumUtils";
import { extrairMensagemErro } from "../../../utils/errorUtils";
import { formatarData, formatarMoeda } from "../../../utils/formatters";
import { ApoliceNumero } from "../../apolices/components/ApoliceNumero";
import { SeguradoNome } from "../../segurados/components/SeguradoNome";
import {
  useAguardarDocumentos,
  useAtribuirAnalista,
  useHistoricoSinistro,
  useSinistroPorId,
} from "../hooks/useSinistros";
import { AdicionarDocumentoModal } from "./AdicionarDocumentoModal";
import { AnalistaNome } from "./AnalistaNome";

export interface SinistroDetailDrawerProps {
  sinistro: Sinistro | null;
  isOpen: boolean;
  onClose: () => void;
  onAlterarStatus?: (sinistro: Sinistro) => void;
  onSinistroAtualizado?: (sinistro: Sinistro) => void;
  onAtribuir?: (sinistro: Sinistro) => void;
}

type Aba = "detalhes" | "documentos" | "historico";

const COLUNAS_HISTORICO = [
  "Data/Hora",
  "Status Anterior",
  "Status Novo",
  "Observação",
];

const COLUNAS_DOCUMENTOS = [
  "Tipo",
  "Nome do Arquivo",
  "URL do Arquivo",
  "Data do Envio",
];

export const SinistroDetailDrawer: React.FC<SinistroDetailDrawerProps> = ({
  sinistro,
  isOpen,
  onClose,
  onAlterarStatus,
  onSinistroAtualizado,
  onAtribuir,
}) => {
  const [abaAtiva, setAbaAtiva] = useState<Aba>("detalhes");
  const [erroAtribuicao, setErroAtribuicao] = useState<string | null>(null);
  const [sucessoAcao, setSucessoAcao] = useState<string | null>(null);
  const [modalUploadAberto, setModalUploadAberto] = useState(false);

  const { usuario } = useAuth();
  const atribuirMutation = useAtribuirAnalista();
  const aguardarDocsMutation = useAguardarDocumentos();

  const isAnalista = usuario?.papel === "ANALISTA";
  const podeGerenciarSinistros =
    usuario?.papel === "ANALISTA" ||
    usuario?.papel === "GESTOR" ||
    usuario?.papel === "ADMIN";
  const textoBotaoAtribuir = isAnalista
    ? "Assumir Análise"
    : "Atribuir Analista";

  const { data: historico = [], isLoading: loadingHistorico } =
    useHistoricoSinistro(sinistro?.id);

  const { data: sinistroDetalhado, refetch: refetchDetalhes } =
    useSinistroPorId(sinistro?.id);

  if (!sinistro) return null;

  const documentos = sinistroDetalhado?.documentos || [];
  const statusAtual = sinistroDetalhado?.status || sinistro.status;

  const handleAssumirSinistro = async () => {
    if (!sinistro?.id || !usuario?.id) return;
    setErroAtribuicao(null);
    setSucessoAcao(null);
    try {
      const atualizado = await atribuirMutation.mutateAsync({
        id: sinistro.id,
        analistaId: usuario.id,
      });
      refetchDetalhes();
      if (onSinistroAtualizado) {
        onSinistroAtualizado(atualizado);
      }
    } catch (err: unknown) {
      console.error("Erro ao assumir sinistro:", err);
      setErroAtribuicao(
        extrairMensagemErro(
          err,
          "Não foi possível assumir a análise do sinistro.",
        ),
      );
    }
  };

  const handleSolicitarDocumentos = async () => {
    if (!sinistro?.id) return;
    setErroAtribuicao(null);
    setSucessoAcao(null);
    try {
      const atualizado = await aguardarDocsMutation.mutateAsync(sinistro.id);
      setSucessoAcao("Status atualizado para AGUARDANDO_DOCUMENTOS.");
      refetchDetalhes();
      if (onSinistroAtualizado) {
        onSinistroAtualizado(atualizado);
      }
    } catch (err: unknown) {
      console.error("Erro ao solicitar documentos:", err);
      setErroAtribuicao(
        extrairMensagemErro(
          err,
          "Não foi possível alterar o status para aguardar documentos.",
        ),
      );
    }
  };

  const handleDocumentoAdicionado = (doc: DocumentoSinistro) => {
    setSucessoAcao(
      `Documento "${doc.nomeArquivo}" anexado com sucesso! Se o status era AGUARDANDO_DOCUMENTOS, agora retornou para EM ANÁLISE.`,
    );
    refetchDetalhes();
    if (sinistroDetalhado && onSinistroAtualizado) {
      onSinistroAtualizado({
        ...sinistro,
        status:
          sinistro.status === "AGUARDANDO_DOCUMENTOS"
            ? "EM_ANALISE"
            : sinistro.status,
      });
    }
  };

  const handleClickAtribuir = () => {
    if (onAtribuir) {
      onAtribuir(sinistro);
    } else {
      handleAssumirSinistro();
    }
  };

  return (
    <>
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
            onChange={(tab) => setAbaAtiva(tab as Aba)}
            tabs={[
              { id: "detalhes", label: "Dados do Sinistro" },
              {
                id: "documentos",
                label: "Documentos",
                count: documentos.length,
              },
              {
                id: "historico",
                label: "Histórico de Status",
                count: historico.length,
              },
            ]}
          />

          {/* Feedback de Ações */}
          {erroAtribuicao && (
            <div className="p-3 rounded-lg bg-(--danger-soft) border border-rose-200 text-(--danger) text-xs flex items-center justify-between">
              <span>{erroAtribuicao}</span>
              <button
                type="button"
                onClick={() => setErroAtribuicao(null)}
                className="text-xs hover:underline font-medium cursor-pointer"
              >
                Fechar
              </button>
            </div>
          )}

          {sucessoAcao && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs flex items-center justify-between">
              <span>{sucessoAcao}</span>
              <button
                type="button"
                onClick={() => setSucessoAcao(null)}
                className="text-xs hover:underline font-medium cursor-pointer"
              >
                Fechar
              </button>
            </div>
          )}

          {/* Dados do Sinistro */}
          {abaAtiva === "detalhes" && (
            <div className="space-y-4">
              {statusAtual === "REGISTRADO" && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-lg bg-(--surface-2)/70 border border-(--accent-border) gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-(--accent-ink)">
                      Sinistro aguardando início de análise
                    </div>
                    <div className="text-xs text-(--muted)">
                      Atribua o sinistro para assumir a verificação dos
                      documentos e prosseguir.
                    </div>
                  </div>
                  {usuario?.id && podeGerenciarSinistros && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleClickAtribuir}
                      disabled={atribuirMutation.isPending}
                    >
                      {atribuirMutation.isPending
                        ? "Atribuindo..."
                        : textoBotaoAtribuir}
                    </Button>
                  )}
                </div>
              )}

              {statusAtual === "AGUARDANDO_DOCUMENTOS" && (
                <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Sinistro Aguardando Documentos
                    </div>
                    <div className="text-(--muted)">
                      Envie os comprovantes ou laudos com suas URLs para
                      retornar a análise.
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setModalUploadAberto(true)}
                  >
                    Anexar Documento
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-lg bg-(--surface-2)/60 border border-(--border) text-xs">
                <span className="text-(--muted)">
                  ID do Sinistro no Sistema:
                </span>
                <CopyableId id={sinistro.id || ""} truncate />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-(--surface-2)/40 p-4 sm:p-5 rounded-lg border border-(--border)">
                <DetailField
                  label="Número do Sinistro"
                  value={
                    <span className="font-semibold">
                      {sinistro.numeroSinistro}
                    </span>
                  }
                />
                <DetailField
                  label="Apólice Vinculada"
                  value={
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-(--fg)">
                        <ApoliceNumero apoliceId={sinistro.apoliceId} />
                      </span>
                      <CopyableId id={sinistro.apoliceId} truncate />
                    </div>
                  }
                />
                <DetailField
                  label="Segurado Vinculado"
                  value={
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-(--fg)">
                        <SeguradoNome seguradoId={sinistro.seguradoId} />
                      </span>
                      <CopyableId id={sinistro.seguradoId} truncate />
                    </div>
                  }
                />
                <DetailField
                  label="Analista Responsável"
                  value={
                    sinistro.analistaId ? (
                      <div className="flex items-center justify-between gap-2">
                        <AnalistaNome
                          analistaId={sinistro.analistaId}
                          showIcon
                        />
                        <CopyableId id={sinistro.analistaId} truncate />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-(--muted) italic">
                          Não atribuído
                        </span>
                        {statusAtual === "REGISTRADO" &&
                          usuario?.id &&
                          podeGerenciarSinistros && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={handleClickAtribuir}
                              disabled={atribuirMutation.isPending}
                            >
                              {atribuirMutation.isPending
                                ? "Atribuindo..."
                                : isAnalista
                                  ? "Assumir"
                                  : "Atribuir"}
                            </Button>
                          )}
                      </div>
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
                    <Badge variant={getSinistroStatusBadgeVariant(statusAtual)}>
                      {formatarStatusSinistro(statusAtual)}
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
            </div>
          )}

          {/* Aba de Documentos */}
          {abaAtiva === "documentos" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-(--surface-2)/60 border border-(--border)">
                <div className="text-xs text-(--muted)">
                  <strong className="text-(--fg)">
                    Documentos Comprobatórios:
                  </strong>{" "}
                  Anexe Boletim de Ocorrência, fotos dos danos ou notas fiscais
                  através de URLs para fundamentar a análise e aprovação.
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/sinistros/${sinistro.id}/documentos`}
                    className="text-xs text-(--accent-ink) hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <span>Página dedicada</span>
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
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </Link>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setModalUploadAberto(true)}
                    disabled={!sinistro.analistaId}
                    title={
                      !sinistro.analistaId
                        ? "Atribua um analista antes de anexar documentos."
                        : undefined
                    }
                  >
                    + Anexar Documento via URL
                  </Button>
                </div>
              </div>

              <TableContainer
                variant="embedded"
                isEmpty={documentos.length === 0}
                emptyTitle="Nenhum documento anexado"
                emptyDescription="Este sinistro ainda não possui documentos anexados. Adicione a URL do primeiro documento para avançar com a liquidação."
              >
                <TableHeader columns={COLUNAS_DOCUMENTOS} />
                <tbody className="divide-y divide-(--border)">
                  {documentos.map((doc, idx) => (
                    <TableRow key={doc.id || `${doc.nomeArquivo}-${idx}`}>
                      <TableCell>
                        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-(--surface-2) border border-(--border) text-(--fg)">
                          {formatarTipoDocumento(doc.tipoDocumento)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-(--fg)">
                        {doc.nomeArquivo}
                      </TableCell>
                      <TableCell className="text-xs font-mono max-w-xs truncate">
                        <a
                          href={doc.urlArquivo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-(--accent-ink) hover:underline flex items-center gap-1"
                          title={doc.urlArquivo}
                        >
                          <span className="truncate">{doc.urlArquivo}</span>
                          <svg
                            className="w-3.5 h-3.5 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </TableCell>
                      <TableCell className="text-xs text-(--muted)">
                        {formatarData(doc.dataUpload)}
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </TableContainer>
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

          {/* Rodapé de Ações */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-(--border)">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {statusAtual === "REGISTRADO" &&
                usuario?.id &&
                podeGerenciarSinistros && (
                  <Button
                    variant="primary"
                    onClick={handleClickAtribuir}
                    disabled={atribuirMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {atribuirMutation.isPending
                      ? "Atribuindo..."
                      : textoBotaoAtribuir}
                  </Button>
                )}

              {podeGerenciarSinistros && statusAtual === "EM_ANALISE" && (
                <Button
                  variant="secondary"
                  onClick={handleSolicitarDocumentos}
                  disabled={aguardarDocsMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {aguardarDocsMutation.isPending
                    ? "Solicitando..."
                    : "Solicitar Documentos"}
                </Button>
              )}

              {sinistro.analistaId && (
                <Button
                  variant="secondary"
                  onClick={() => setModalUploadAberto(true)}
                  className="w-full sm:w-auto"
                >
                  + Anexar Documento
                </Button>
              )}

              {podeGerenciarSinistros &&
                ["EM_ANALISE", "AGUARDANDO_DOCUMENTOS"].includes(statusAtual) &&
                onAlterarStatus && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      onClose();
                      onAlterarStatus(sinistro);
                    }}
                    className="w-full sm:w-auto"
                  >
                    Decidir Sinistro
                  </Button>
                )}
            </div>

            <Button
              variant="secondary"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Fechar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Anexo de Documento */}
      {sinistro.id && (
        <AdicionarDocumentoModal
          isOpen={modalUploadAberto}
          onClose={() => setModalUploadAberto(false)}
          sinistroId={sinistro.id}
          numeroSinistro={sinistro.numeroSinistro}
          onSuccess={handleDocumentoAdicionado}
        />
      )}
    </>
  );
};
