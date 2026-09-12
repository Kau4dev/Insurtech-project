import React, { useState } from "react";
import { Button, Modal, Pagination } from "../components/ui";
import {
  AprovarRejeitarModal,
  SinistroDetailDrawer,
  SinistroFilters,
  SinistroForm,
  SinistroTable,
  useAprovarSinistro,
  useCadastrarSinistro,
  useRejeitarSinistro,
  useSinistros,
} from "../features/sinistros";
import type { TipoAcaoSinistro } from "../features/sinistros/components/AprovarRejeitarModal";
import type { StatusSinistro, TipoSinistro } from "../interfaces/enums";
import type { Sinistro } from "../interfaces/sinistros/sinistro";
import type { SinistroRequest } from "../interfaces/sinistros/sinistroRequest";

export const SinistrosListPage: React.FC = () => {
  const [status, setStatus] = useState<StatusSinistro | "">("");
  const [tipoSinistro, setTipoSinistro] = useState<TipoSinistro | "">("");
  const [seguradoId, setSeguradoId] = useState<string | "">("");
  const [page, setPage] = useState<number>(0);
  const size = 10;

  // Modal de Criação de Sinistro
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal de Aprovação / Rejeição
  const [acaoModal, setAcaoModal] = useState<TipoAcaoSinistro | null>(null);
  const [sinistroParaAcao, setSinistroParaAcao] = useState<Sinistro | null>(
    null,
  );
  const [acaoError, setAcaoError] = useState<string | null>(null);

  // Drawer de Detalhes
  const [sinistroParaDetalhes, setSinistroParaDetalhes] =
    useState<Sinistro | null>(null);

  const { data, isLoading, isError } = useSinistros({
    status: status || undefined,
    tipoSinistro: tipoSinistro || undefined,
    seguradoId: seguradoId || undefined,
    page,
    size,
  });

  const criarMutation = useCadastrarSinistro();
  const aprovarMutation = useAprovarSinistro();
  const rejeitarMutation = useRejeitarSinistro();

  const handleSearch = (filtros: {
    termo: string;
    status: StatusSinistro | "";
    tipoSinistro: TipoSinistro | "";
  }) => {
    setSeguradoId(filtros.termo);
    setStatus(filtros.status);
    setTipoSinistro(filtros.tipoSinistro);
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

  const handleSalvarSinistro = async (dto: SinistroRequest) => {
    setFormError(null);
    try {
      await criarMutation.mutateAsync(dto);
      handleFecharModal();
    } catch (err: unknown) {
      console.error("Erro ao salvar sinistro:", err);
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
          "Não foi possível registrar o sinistro. Verifique os dados ou a conexão com o servidor.",
        );
      }
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
      setAcaoError("Não foi possível aprovar o sinistro.");
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
      setAcaoError("Não foi possível rejeitar o sinistro.");
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
          <h1 className="text-2xl font-bold text-(--fg)">Sinistros</h1>
          <p className="text-sm text-(--muted) mt-0.5">
            Gerencie os sinistros registrados, análises e liquidações.
          </p>
        </div>

        <Button variant="primary" onClick={handleAbrirNovo}>
          Novo Sinistro
        </Button>
      </div>

      {/* Modal de Cadastro de Sinistro */}
      <Modal
        isOpen={modalAberto}
        onClose={handleFecharModal}
        title="Registrar Novo Sinistro"
        description="Preencha os dados do sinistro para abertura do processo."
        maxWidthClass="max-w-3xl"
      >
        <SinistroForm
          onSubmit={handleSalvarSinistro}
          onCancel={handleFecharModal}
          isLoading={isSaving}
          errorMessage={formError}
        />
      </Modal>

      {/* Filtros */}
      <SinistroFilters onSearch={handleSearch} isLoading={isLoading} />

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
        onVisualizar={setSinistroParaDetalhes}
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
        onClose={() => setSinistroParaDetalhes(null)}
        onAlterarStatus={(s: Sinistro) => handleAcaoSinistro(s, "aprovar")}
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
    </div>
  );
};
