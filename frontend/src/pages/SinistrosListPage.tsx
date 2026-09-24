import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Modal, Pagination } from "../components/ui";
import { useAuth } from "../context/useAuth";
import {
  AprovarRejeitarModal,
  AtribuirAnalistaModal,
  SinistroDetailDrawer,
  SinistroFilters,
  SinistroForm,
  SinistroTable,
  useAprovarSinistro,
  useAtribuirAnalista,
  useCadastrarSinistro,
  useRejeitarSinistro,
  useSinistros,
} from "../features/sinistros";
import type { TipoAcaoSinistro } from "../features/sinistros/components/AprovarRejeitarModal";
import type { StatusSinistro, TipoSinistro } from "../interfaces/enums";
import type { Sinistro } from "../interfaces/sinistros/sinistro";
import type { SinistroRequest } from "../interfaces/sinistros/sinistroRequest";
import { extrairMensagemErro } from "../utils/errorUtils";

export const SinistrosListPage: React.FC = () => {
  const { usuario } = useAuth();
  const podeCadastrarSinistro =
    usuario?.papel === "ANALISTA" ||
    usuario?.papel === "GESTOR" ||
    usuario?.papel === "ADMIN";
  const [searchParams, setSearchParams] = useSearchParams();
  const seguradoId = searchParams.get("busca") || "";
  const detalheId = searchParams.get("detalheId") || "";
  const apoliceIdQuery = searchParams.get("apoliceId") || "";
  const seguradoIdQuery = searchParams.get("seguradoId") || "";
  const isNovoQuery = searchParams.get("novo") === "true";

  const [status, setStatus] = useState<StatusSinistro | "">("");
  const [tipoSinistro, setTipoSinistro] = useState<TipoSinistro | "">("");
  const [page, setPage] = useState<number>(0);
  const size = 10;

  // Modal de Criação de Sinistro
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const isModalCriarAberto = modalAberto || isNovoQuery;

  // Modal de Aprovação / Rejeição
  const [acaoModal, setAcaoModal] = useState<TipoAcaoSinistro | null>(null);
  const [sinistroParaAcao, setSinistroParaAcao] = useState<Sinistro | null>(
    null,
  );
  const [acaoError, setAcaoError] = useState<string | null>(null);

  // Modal de Atribuição de Analista
  const [sinistroParaAtribuir, setSinistroParaAtribuir] =
    useState<Sinistro | null>(null);
  const [atribuirError, setAtribuirError] = useState<string | null>(null);

  // Drawer de Detalhes
  const [sinistroManual, setSinistroManual] = useState<Sinistro | null>(null);

  const { data, isLoading, isError } = useSinistros({
    status: status || undefined,
    tipoSinistro: tipoSinistro || undefined,
    seguradoId: seguradoId || undefined,
    page,
    size,
  });

  const sinistroPelaUrl =
    detalheId && data?.content
      ? data.content.find(
          (s) => s.id === detalheId || s.numeroSinistro === detalheId,
        ) || null
      : null;

  const sinistroParaDetalhes = sinistroManual || sinistroPelaUrl;

  const handleFecharDetalhes = () => {
    setSinistroManual(null);
    if (searchParams.has("detalheId")) {
      const next = new URLSearchParams(searchParams);
      next.delete("detalheId");
      setSearchParams(next);
    }
  };

  const criarMutation = useCadastrarSinistro();
  const aprovarMutation = useAprovarSinistro();
  const rejeitarMutation = useRejeitarSinistro();
  const atribuirMutation = useAtribuirAnalista();

  const handleSearch = (filtros: {
    termo: string;
    status: StatusSinistro | "";
    tipoSinistro: TipoSinistro | "";
  }) => {
    setStatus(filtros.status);
    setTipoSinistro(filtros.tipoSinistro);
    setPage(0);
    const next = new URLSearchParams(searchParams);
    if (filtros.termo) {
      next.set("busca", filtros.termo);
    } else {
      next.delete("busca");
    }
    setSearchParams(next);
  };

  const handleAbrirNovo = () => {
    setFormError(null);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setFormError(null);
    if (
      searchParams.has("novo") ||
      searchParams.has("apoliceId") ||
      searchParams.has("seguradoId")
    ) {
      const next = new URLSearchParams(searchParams);
      next.delete("novo");
      next.delete("apoliceId");
      next.delete("seguradoId");
      setSearchParams(next);
    }
  };

  const handleSalvarSinistro = async (dto: SinistroRequest) => {
    setFormError(null);
    try {
      await criarMutation.mutateAsync(dto);
      handleFecharModal();
    } catch (err: unknown) {
      console.error("Erro ao salvar sinistro:", err);
      setFormError(
        extrairMensagemErro(
          err,
          "Não foi possível registrar o sinistro. Verifique os dados ou a conexão com o servidor.",
        ),
      );
    }
  };

  // Abre modal de aprovação/rejeição
  const handleAcaoSinistro = (
    sinistro: Sinistro,
    acao: TipoAcaoSinistro = "aprovar",
  ) => {
    setSinistroParaAcao(sinistro);
    setAcaoModal(acao);
    setAcaoError(null);
  };

  const handleFecharAcaoModal = () => {
    setAcaoModal(null);
    setSinistroParaAcao(null);
    setAcaoError(null);
  };

  const handleConfirmarAprovacao = async (valorAprovado: number) => {
    if (!sinistroParaAcao?.id) return;
    setAcaoError(null);
    try {
      await aprovarMutation.mutateAsync({
        id: sinistroParaAcao.id,
        dto: { valorAprovado },
      });
      handleFecharAcaoModal();
    } catch (err) {
      console.error("Erro ao aprovar sinistro:", err);
      setAcaoError(
        extrairMensagemErro(err, "Não foi possível aprovar o sinistro."),
      );
    }
  };

  const handleConfirmarRejeicao = async (motivoRejeicao: string) => {
    if (!sinistroParaAcao?.id) return;
    setAcaoError(null);
    try {
      await rejeitarMutation.mutateAsync({
        id: sinistroParaAcao.id,
        dto: { motivoRejeicao },
      });
      handleFecharAcaoModal();
    } catch (err) {
      console.error("Erro ao rejeitar sinistro:", err);
      setAcaoError(
        extrairMensagemErro(err, "Não foi possível rejeitar o sinistro."),
      );
    }
  };

  const handleAbrirAtribuir = (sinistro: Sinistro) => {
    setSinistroParaAtribuir(sinistro);
    setAtribuirError(null);
  };

  const handleFecharAtribuir = () => {
    setSinistroParaAtribuir(null);
    setAtribuirError(null);
  };

  const handleConfirmarAtribuicao = async (analistaId: string) => {
    if (!sinistroParaAtribuir?.id) return;
    setAtribuirError(null);
    try {
      const atualizado = await atribuirMutation.mutateAsync({
        id: sinistroParaAtribuir.id,
        analistaId,
      });
      handleFecharAtribuir();
      if (sinistroManual?.id === atualizado.id) {
        setSinistroManual(atualizado);
      }
    } catch (err: unknown) {
      console.error("Erro ao atribuir analista:", err);
      setAtribuirError(
        extrairMensagemErro(
          err,
          "Não foi possível atribuir o analista ao sinistro.",
        ),
      );
    }
  };

  const isSaving = criarMutation.isPending;
  const sinistros = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-(--accent-ink) font-semibold">
            Operações
          </div>
          <h1 className="text-2xl font-bold text-(--fg)">Sinistros</h1>
          <p className="text-sm text-(--muted) mt-0.5">
            Todas as ocorrências registradas, com filtros por status e tipo.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleAbrirNovo}
          disabled={!podeCadastrarSinistro}
          title={
            !podeCadastrarSinistro
              ? "Apenas Analistas, Gestores ou Administradores podem registrar sinistros."
              : undefined
          }
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Registrar sinistro
        </Button>
      </div>

      {/* Modal de Cadastro de Sinistro */}
      <Modal
        isOpen={isModalCriarAberto}
        onClose={handleFecharModal}
        title="Registrar Novo Sinistro"
        description="Preencha os dados do sinistro para abertura do processo."
        maxWidthClass="max-w-3xl"
      >
        <SinistroForm
          key={
            isModalCriarAberto ? `open-${apoliceIdQuery || "novo"}` : "closed"
          }
          apoliceInicialId={apoliceIdQuery || undefined}
          seguradoInicialId={seguradoIdQuery || undefined}
          onSubmit={handleSalvarSinistro}
          onCancel={handleFecharModal}
          isLoading={isSaving}
          errorMessage={formError}
        />
      </Modal>

      {/* Filtros */}
      <SinistroFilters
        key={seguradoId}
        onSearch={handleSearch}
        isLoading={isLoading}
        initialTermo={seguradoId}
      />

      {/* Erro de Carregamento */}
      {isError && (
        <div className="p-4 rounded-lg bg-(--danger-soft) border border-rose-200 text-(--danger) text-sm">
          Ocorreu um erro ao carregar os sinistros. Verifique se o backend está
          ativo.
        </div>
      )}

      {/* Tabela de Sinistros */}
      <SinistroTable
        sinistros={sinistros}
        isLoading={isLoading}
        onEditar={(s: Sinistro) => handleAcaoSinistro(s, "aprovar")}
        onVisualizar={setSinistroManual}
        onAtribuir={handleAbrirAtribuir}
      />

      {/* Paginação */}
      {!isLoading && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={size}
          onPageChange={setPage}
        />
      )}

      {/* Drawer de Detalhes */}
      <SinistroDetailDrawer
        sinistro={sinistroParaDetalhes}
        isOpen={Boolean(sinistroParaDetalhes)}
        onClose={handleFecharDetalhes}
        onAlterarStatus={(s: Sinistro) => handleAcaoSinistro(s, "aprovar")}
        onSinistroAtualizado={setSinistroManual}
        onAtribuir={handleAbrirAtribuir}
      />

      {/* Modal de Aprovar / Rejeitar */}
      <AprovarRejeitarModal
        isOpen={Boolean(acaoModal && sinistroParaAcao)}
        onClose={handleFecharAcaoModal}
        sinistro={sinistroParaAcao}
        acao={acaoModal}
        onConfirmAprovar={handleConfirmarAprovacao}
        onConfirmRejeitar={handleConfirmarRejeicao}
        isLoading={aprovarMutation.isPending || rejeitarMutation.isPending}
        errorMessage={acaoError}
      />

      {/* Modal de Atribuir Analista */}
      <AtribuirAnalistaModal
        isOpen={Boolean(sinistroParaAtribuir)}
        onClose={handleFecharAtribuir}
        sinistro={sinistroParaAtribuir}
        onConfirm={handleConfirmarAtribuicao}
        isLoading={atribuirMutation.isPending}
        errorMessage={atribuirError}
      />
    </div>
  );
};
