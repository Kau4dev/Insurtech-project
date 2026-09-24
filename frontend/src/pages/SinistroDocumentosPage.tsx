import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Badge,
  Button,
  CopyableId,
  TableActions,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "../components/ui";
import { useAuth } from "../context/useAuth";
import { ApoliceNumero } from "../features/apolices/components/ApoliceNumero";
import { SeguradoNome } from "../features/segurados/components/SeguradoNome";
import {
  AdicionarDocumentoModal,
  AnalistaNome,
  useAguardarDocumentos,
  useSinistroPorId,
  useSinistros,
} from "../features/sinistros";
import type { DocumentoSinistro } from "../interfaces/sinistros/documentoSinistro";
import {
  formatarStatusSinistro,
  formatarTipoDocumento,
  formatarTipoSinistro,
  getSinistroStatusBadgeVariant,
} from "../utils/enumUtils";
import { extrairMensagemErro } from "../utils/errorUtils";
import { formatarData, formatarMoeda } from "../utils/formatters";

const COLUNAS_DOCUMENTOS = [
  "Tipo",
  "Nome do Arquivo",
  "URL do Arquivo",
  "Data do Envio",
  { label: "Ações", align: "center" as const },
];

export const SinistroDocumentosPage: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [modalUploadAberto, setModalUploadAberto] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  // Se o parâmetro na URL for UUID ou número, resolvemos o ID real
  const { data: sinistrosList } = useSinistros();
  const sinistroEncontrado = sinistrosList?.content?.find(
    (s) => s.id === id || s.numeroSinistro === id,
  );
  const sinistroIdReal = sinistroEncontrado?.id || id;

  const {
    data: sinistro,
    isLoading,
    isError,
    refetch,
  } = useSinistroPorId(sinistroIdReal);

  const aguardarDocsMutation = useAguardarDocumentos();

  const podeGerenciar =
    usuario?.papel === "ANALISTA" ||
    usuario?.papel === "GESTOR" ||
    usuario?.papel === "ADMIN";

  const handleSolicitarDocumentos = async () => {
    if (!sinistro?.id) return;
    setErroAcao(null);
    setMensagemSucesso(null);
    try {
      await aguardarDocsMutation.mutateAsync(sinistro.id);
      setMensagemSucesso(
        "Status do sinistro atualizado para AGUARDANDO_DOCUMENTOS.",
      );
      refetch();
    } catch (err) {
      setErroAcao(
        extrairMensagemErro(
          err,
          "Não foi possível alterar o status para aguardar documentos.",
        ),
      );
    }
  };

  const handleDocumentoAdicionado = (doc: DocumentoSinistro) => {
    setMensagemSucesso(
      `Documento "${doc.nomeArquivo}" adicionado com sucesso! Se o sinistro estava aguardando documentos, o status retornou para EM ANÁLISE.`,
    );
    refetch();
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-(--surface-2) animate-pulse rounded" />
        <div className="h-40 bg-(--surface-2) animate-pulse rounded-lg" />
        <div className="h-64 bg-(--surface-2) animate-pulse rounded-lg" />
      </div>
    );
  }

  if (isError || !sinistro) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-4">
        <Link
          to="/sinistros"
          className="text-xs text-(--accent-ink) hover:underline flex items-center gap-1 mb-4"
        >
          ← Voltar para Sinistros
        </Link>
        <div className="p-4 rounded-lg bg-(--danger-soft) border border-rose-200 text-(--danger) text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span>
            Sinistro não encontrado ou erro ao carregar os dados. Verifique o
            identificador informado e se o backend está ativo.
          </span>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const documentos = sinistro.documentos || [];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Navegação de Volta */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/sinistros")}
          className="text-xs text-(--accent-ink) hover:underline flex items-center gap-1 cursor-pointer font-medium"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Voltar para Lista de Sinistros
        </button>

        <div className="text-xs text-(--muted)">
          ID do Sinistro: <CopyableId id={sinistro.id || ""} truncate />
        </div>
      </div>

      {/* Cabeçalho do Sinistro */}
      <div className="p-5 rounded-xl bg-(--surface-2)/60 border border-(--border) space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-(--fg)">
                Sinistro {sinistro.numeroSinistro}
              </h1>
              <Badge variant={getSinistroStatusBadgeVariant(sinistro.status)}>
                {formatarStatusSinistro(sinistro.status)}
              </Badge>
            </div>
            <p className="text-sm text-(--muted) mt-1">
              {formatarTipoSinistro(sinistro.tipoSinistro)} · Ocorrido em{" "}
              {formatarData(sinistro.dataOcorrencia)} · Estimado em{" "}
              <strong className="text-(--fg)">
                {formatarMoeda(sinistro.valorEstimado)}
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {podeGerenciar && sinistro.status === "EM_ANALISE" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSolicitarDocumentos}
                disabled={aguardarDocsMutation.isPending}
              >
                {aguardarDocsMutation.isPending
                  ? "Solicitando..."
                  : "Solicitar Documentos"}
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalUploadAberto(true)}
              disabled={!sinistro.analistaId}
              title={
                !sinistro.analistaId
                  ? "É necessário atribuir um analista ao sinistro antes de anexar documentos."
                  : undefined
              }
            >
              <svg
                className="w-4 h-4 mr-1"
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
              Anexar Documento via URL
            </Button>
          </div>
        </div>

        {/* Metadados do Sinistro */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-(--border) text-xs">
          <div>
            <span className="text-(--muted)">Segurado: </span>
            <span className="font-semibold text-(--fg)">
              <SeguradoNome seguradoId={sinistro.seguradoId} />
            </span>
          </div>

          <div>
            <span className="text-(--muted)">Apólice: </span>
            <span className="font-semibold text-(--fg)">
              <ApoliceNumero apoliceId={sinistro.apoliceId} />
            </span>
          </div>

          <div>
            <span className="text-(--muted)">Analista Responsável: </span>
            <span className="font-semibold text-(--fg)">
              {sinistro.analistaId ? (
                <AnalistaNome analistaId={sinistro.analistaId} />
              ) : (
                <span className="italic text-(--muted)">Não atribuído</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Banners Informativos / Feedback */}
      {mensagemSucesso && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs flex items-center justify-between">
          <span>{mensagemSucesso}</span>
          <button
            type="button"
            onClick={() => setMensagemSucesso(null)}
            className="text-xs text-emerald-800 hover:underline font-medium cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {erroAcao && (
        <div className="p-3.5 rounded-lg bg-(--danger-soft) border border-rose-200 text-(--danger) text-xs flex items-center justify-between">
          <span>{erroAcao}</span>
          <button
            type="button"
            onClick={() => setErroAcao(null)}
            className="text-xs hover:underline font-medium cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {sinistro.status === "AGUARDANDO_DOCUMENTOS" && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 space-y-1 text-xs">
          <div className="font-semibold flex items-center gap-1.5 text-sm">
            <svg
              className="w-4 h-4 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Sinistro aguardando documentos complementares
          </div>
          <p className="text-(--muted)">
            O processo está pausado aguardando envio de comprovantes, laudos ou
            fotos pelo segurado ou analista. Ao anexar um novo documento com sua
            respectiva URL, o status retornará automaticamente para{" "}
            <strong>EM ANÁLISE</strong>.
          </p>
        </div>
      )}

      {!sinistro.analistaId && (
        <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-700 text-xs">
          <strong>Atenção:</strong> Este sinistro ainda está no status{" "}
          <strong>REGISTRADO</strong> e não possui analista atribuído. De acordo
          com o fluxo de domínio, o processo precisa ser assumido por um
          analista antes do envio de documentos.
        </div>
      )}

      {/* Lista de Documentos Anexados */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-(--fg) flex items-center gap-2">
            <span>Documentos Anexados</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-(--surface-2) border border-(--border)">
              {documentos.length}
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setModalUploadAberto(true)}
            disabled={!sinistro.analistaId}
          >
            + Anexar Documento
          </Button>
        </div>

        <TableContainer
          isEmpty={documentos.length === 0}
          emptyTitle="Nenhum documento anexado"
          emptyDescription="Ainda não foram anexados arquivos ou laudos a este sinistro. Clique em 'Anexar Documento via URL' para registrar o primeiro."
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

                <TableCell className="font-medium text-(--fg) text-xs">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-(--muted) shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{doc.nomeArquivo}</span>
                  </div>
                </TableCell>

                <TableCell className="text-xs font-mono max-w-xs truncate">
                  <a
                    href={doc.urlArquivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--accent-ink) hover:underline flex items-center gap-1.5"
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

                <TableCell align="center">
                  <TableActions>
                    <a
                      href={doc.urlArquivo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-(--surface-2) text-(--muted) hover:text-(--fg) transition-colors inline-flex items-center"
                      title="Abrir arquivo em nova aba"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </a>
                  </TableActions>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </TableContainer>
      </div>

      {/* Modal de Anexo de Documento */}
      {sinistroIdReal && (
        <AdicionarDocumentoModal
          isOpen={modalUploadAberto}
          onClose={() => setModalUploadAberto(false)}
          sinistroId={sinistroIdReal}
          numeroSinistro={sinistro.numeroSinistro}
          onSuccess={handleDocumentoAdicionado}
        />
      )}
    </div>
  );
};
