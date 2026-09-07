import React, { useState } from "react";
import { Button, Modal, Pagination } from "../components/ui";
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

export const ApolicesListPage: React.FC = () => {
  const [status, setStatus] = useState<StatusApolice | "">("");
  const [tipoSeguro, setTipoSeguro] = useState<TipoSeguro | "">("");
  const [seguradoId, setSeguradoId] = useState<string | "">("");
  const [page, setPage] = useState<number>(0);
  const size = 10;

  // Modal de Criação de Apólice
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal de Alteração de Status da Apólice
  const [statusModalAberto, setStatusModalAberto] = useState<boolean>(false);
  const [apoliceParaStatus, setApoliceParaStatus] = useState<Apolice | null>(
    null,
  );
  const [statusError, setStatusError] = useState<string | null>(null);

  // Drawer de Detalhes
  const [apoliceParaDetalhes, setApoliceParaDetalhes] =
    useState<Apolice | null>(null);

  const { data, isLoading, isError } = useApolices({
    status: status || undefined,
    tipoSeguro: tipoSeguro || undefined,
    seguradoId: seguradoId || undefined,
    page,
    size,
  });

  const criarMutation = useCadastrarApolice();
  const atualizarMutation = useAtualizarStatus();

  const handleSearch = (filtros: {
    termo: string;
    status: StatusApolice | "";
    tipoSeguro: TipoSeguro | "";
  }) => {
    setSeguradoId(filtros.termo);
    setStatus(filtros.status);
    setTipoSeguro(filtros.tipoSeguro);
    setPage(0);
  };

  const handleAbrirNovo = () => {
    setFormError(null);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setFormError(null);
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
    setApoliceParaDetalhes(apolice);
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
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
      ) {
        setFormError(String(err.response.data.message));
      } else {
        setFormError(
          "Não foi possível salvar a apólice. Verifique os dados ou a conexão com o servidor.",
        );
      }
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
        setApoliceParaDetalhes((prev) =>
          prev ? { ...prev, status: novoStatus } : null,
        );
      }

      handleFecharStatusModal();
    } catch (err: unknown) {
      console.error("Erro ao atualizar status:", err);
      setStatusError("Não foi possível atualizar o status da apólice.");
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
          <h1 className="text-2xl font-bold text-(--fg)">Apólices</h1>
          <p className="text-sm text-(--muted) mt-0.5">
            Gerencie as apólices emitidas e vigências cadastradas no sistema.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleAbrirNovo}
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

      {/* Modal de Criação de Apólice */}
      <Modal
        isOpen={modalAberto}
        onClose={handleFecharModal}
        title="Nova Apólice"
        description="Preencha os dados abaixo para cadastrar uma nova apólice no sistema."
        maxWidthClass="max-w-3xl"
      >
        <ApoliceForm
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
      <ApoliceFilters onSearch={handleSearch} isLoading={isLoading} />

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
        onEditar={handleEditar}
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
        onClose={() => setApoliceParaDetalhes(null)}
        onAlterarStatus={handleEditar}
      />
    </div>
  );
};
