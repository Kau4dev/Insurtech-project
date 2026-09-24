import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Modal, Pagination } from "../components/ui";
import { useAuth } from "../context/useAuth";
import {
  ApoliceDetailDrawer,
  ApoliceFilters,
  ApoliceForm,
  ApoliceStatusModal,
  ApoliceTable,
  useApolices,
  useAtualizarStatus,
  useCadastrarApolice,
} from "../features/apolices";
import type { Apolice } from "../interfaces/apolices/apolice";
import type {
  ApoliceRequest,
  ApoliceUpdateRequest,
} from "../interfaces/apolices/apoliceRequest";
import type { StatusApolice, TipoSeguro } from "../interfaces/enums";
import { extrairMensagemErro } from "../utils/errorUtils";

export const ApolicesListPage: React.FC = () => {
  const { usuario } = useAuth();
  const podeGerenciar =
    usuario?.papel === "GESTOR" || usuario?.papel === "ADMIN";

  const [searchParams, setSearchParams] = useSearchParams();
  const seguradoId = searchParams.get("busca") || "";
  const detalheId = searchParams.get("detalheId") || "";
  const seguradoIdQuery = searchParams.get("seguradoId") || "";
  const isNovoQuery = searchParams.get("novo") === "true";

  const [status, setStatus] = useState<StatusApolice | "">("");
  const [tipoSeguro, setTipoSeguro] = useState<TipoSeguro | "">("");
  const [page, setPage] = useState<number>(0);
  const size = 10;

  // Modal de Criação de Apólice
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const isModalCriarAberto = modalAberto || isNovoQuery;

  // Modal de Alteração de Status da Apólice
  const [statusModalAberto, setStatusModalAberto] = useState<boolean>(false);
  const [apoliceParaStatus, setApoliceParaStatus] = useState<Apolice | null>(
    null,
  );
  const [statusError, setStatusError] = useState<string | null>(null);

  // Drawer de Detalhes
  const [apoliceManual, setApoliceManual] = useState<Apolice | null>(null);

  const { data, isLoading, isError } = useApolices({
    status: status || undefined,
    tipoSeguro: tipoSeguro || undefined,
    seguradoId: seguradoId || undefined,
    page,
    size,
  });

  const apolicePelaUrl =
    detalheId && data?.content
      ? data.content.find(
          (a) => a.id === detalheId || a.numeroApolice === detalheId,
        ) || null
      : null;

  const apoliceParaDetalhes = apoliceManual || apolicePelaUrl;

  const handleFecharDetalhes = () => {
    setApoliceManual(null);
    if (searchParams.has("detalheId")) {
      const next = new URLSearchParams(searchParams);
      next.delete("detalheId");
      setSearchParams(next);
    }
  };

  const criarMutation = useCadastrarApolice();
  const atualizarMutation = useAtualizarStatus();

  const handleSearch = (filtros: {
    termo: string;
    status: StatusApolice | "";
    tipoSeguro: TipoSeguro | "";
  }) => {
    setStatus(filtros.status);
    setTipoSeguro(filtros.tipoSeguro);
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
    if (searchParams.has("novo") || searchParams.has("seguradoId")) {
      const next = new URLSearchParams(searchParams);
      next.delete("novo");
      next.delete("seguradoId");
      setSearchParams(next);
    }
  };

  const handleEditar = (apolice: Apolice) => {
    setApoliceParaStatus(apolice);
    setStatusError(null);
    setStatusModalAberto(true);
  };

  const handleFecharStatusModal = () => {
    setStatusModalAberto(false);
    setApoliceParaStatus(null);
    setStatusError(null);
  };

  const handleVisualizar = (apolice: Apolice) => {
    setApoliceManual(apolice);
  };

  const handleSalvarApolice = async (
    dto: ApoliceRequest | ApoliceUpdateRequest,
  ) => {
    setFormError(null);
    try {
      await criarMutation.mutateAsync(dto as ApoliceRequest);
      handleFecharModal();
    } catch (err: unknown) {
      console.error("Erro ao salvar apólice:", err);
      setFormError(
        extrairMensagemErro(
          err,
          "Não foi possível salvar a apólice. Verifique os dados ou a conexão com o servidor.",
        ),
      );
    }
  };

  const handleConfirmarStatus = async (novoStatus: StatusApolice) => {
    if (!apoliceParaStatus?.id) return;
    setStatusError(null);
    try {
      await atualizarMutation.mutateAsync({
        id: apoliceParaStatus.id,
        status: novoStatus,
      });

      // Se a apólice também estiver aberta no drawer de detalhes, sincroniza o status
      if (apoliceParaDetalhes?.id === apoliceParaStatus.id) {
        setApoliceManual((prev) =>
          prev ? { ...prev, status: novoStatus } : null,
        );
      }

      handleFecharStatusModal();
    } catch (err: unknown) {
      console.error("Erro ao atualizar status:", err);
      setStatusError(
        extrairMensagemErro(
          err,
          "Não foi possível atualizar o status da apólice.",
        ),
      );
    }
  };

  const isSaving = criarMutation.isPending;
  const apolices = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-(--accent-ink) font-semibold">
            portfólio
          </div>
          <h1 className="text-2xl font-bold text-(--fg)">Apólices</h1>
          <p className="text-sm text-(--muted) mt-0.5">
            Contratos, coberturas e status de vigência.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleAbrirNovo}
          disabled={!podeGerenciar}
          title={
            !podeGerenciar
              ? "Apenas Gestores ou Administradores podem cadastrar novas apólices."
              : undefined
          }
          icon={
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
          }
        >
          Nova Apólice
        </Button>
      </div>

      {!podeGerenciar && (
        <div className="p-3.5 rounded-lg bg-(--surface-2) border border-(--border) text-xs text-(--muted) flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-(--accent)" />
            <span>
              Perfil conectado: <strong>{usuario?.papel || "ANALISTA"}</strong>.
              O cadastro e a alteração de status de apólices exigem permissão de{" "}
              <strong>Gestor</strong> ou <strong>Administrador</strong>.
            </span>
          </div>
        </div>
      )}

      {/* Modal de Criação de Apólice */}
      <Modal
        isOpen={isModalCriarAberto}
        onClose={handleFecharModal}
        title="Nova Apólice"
        description="Preencha os dados abaixo para cadastrar uma nova apólice no sistema."
        maxWidthClass="max-w-3xl"
      >
        <ApoliceForm
          key={
            isModalCriarAberto ? `open-${seguradoIdQuery || "novo"}` : "closed"
          }
          seguradoInicialId={seguradoIdQuery || undefined}
          onSubmit={handleSalvarApolice}
          onCancel={handleFecharModal}
          isLoading={isSaving}
          errorMessage={formError}
        />
      </Modal>

      {/* Modal de Alteração de Status */}
      <ApoliceStatusModal
        isOpen={statusModalAberto}
        onClose={handleFecharStatusModal}
        statusAtual={apoliceParaStatus?.status}
        onConfirm={handleConfirmarStatus}
        isLoading={atualizarMutation.isPending}
        errorMessage={statusError}
      />

      {/* Filtros */}
      <ApoliceFilters
        key={seguradoId}
        onSearch={handleSearch}
        isLoading={isLoading}
        initialTermo={seguradoId}
      />

      {/* Mensagem de Erro de Carga */}
      {isError && (
        <div className="p-4 rounded-lg bg-(--danger-soft) border border-rose-200 text-(--danger) text-sm">
          Ocorreu um erro ao carregar as apólices. Verifique se o serviço
          backend está ativo e tente novamente.
        </div>
      )}

      {/* Tabela de Apólices */}
      <ApoliceTable
        apolices={apolices}
        isLoading={isLoading}
        onEditar={podeGerenciar ? handleEditar : undefined}
        onVisualizar={handleVisualizar}
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

      {/* Drawer com Detalhes da Apólice */}
      <ApoliceDetailDrawer
        apolice={apoliceParaDetalhes}
        isOpen={Boolean(apoliceParaDetalhes)}
        onClose={handleFecharDetalhes}
        onAlterarStatus={podeGerenciar ? handleEditar : undefined}
      />
    </div>
  );
};
