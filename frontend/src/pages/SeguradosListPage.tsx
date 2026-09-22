import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Modal, Pagination } from "../components/ui";
import {
  SeguradoDetailDrawer,
  SeguradoFilters,
  SeguradoForm,
  SeguradoTable,
  useAtualizarSegurado,
  useCadastrarSegurado,
  useSegurados,
} from "../features/segurados";
import type { Segurado } from "../interfaces/segurados/segurado";
import type {
  SeguradoRequest,
  SeguradoUpdateRequest,
} from "../interfaces/segurados/seguradoRequest";

export const SeguradosListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const nome = searchParams.get("busca") || "";
  const detalheId = searchParams.get("detalheId") || "";

  const [page, setPage] = useState<number>(0);
  const size = 10;

  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [seguradoEmEdicao, setSeguradoEmEdicao] = useState<Segurado | null>(
    null,
  );
  const [seguradoManual, setSeguradoManual] = useState<Segurado | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading, isError } = useSegurados({
    nome: nome || undefined,
    page,
    size,
  });

  const seguradoPelaUrl =
    detalheId && data?.content
      ? data.content.find(
          (s) =>
            s.id === detalheId ||
            s.nomeRazaoSocial === detalheId ||
            s.cpfCnpj === detalheId
        ) || null
      : null;

  const seguradoParaDetalhes = seguradoManual || seguradoPelaUrl;

  const handleFecharDetalhes = () => {
    setSeguradoManual(null);
    if (searchParams.has("detalheId")) {
      const next = new URLSearchParams(searchParams);
      next.delete("detalheId");
      setSearchParams(next);
    }
  };

  const criarMutation = useCadastrarSegurado();
  const atualizarMutation = useAtualizarSegurado();

  const handleSearch = (termo: string) => {
    setPage(0);
    const next = new URLSearchParams(searchParams);
    if (termo) {
      next.set("busca", termo);
    } else {
      next.delete("busca");
    }
    setSearchParams(next);
  };

  const handleAbrirNovo = () => {
    setSeguradoEmEdicao(null);
    setFormError(null);
    setModalAberto(true);
  };

  const handleEditar = (segurado: Segurado) => {
    setSeguradoEmEdicao(segurado);
    setFormError(null);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setSeguradoEmEdicao(null);
    setFormError(null);
  };

  const handleVisualizar = (segurado: Segurado) => {
    setSeguradoManual(segurado);
  };

  const handleSalvarSegurado = async (
    dto: SeguradoRequest | SeguradoUpdateRequest,
  ) => {
    setFormError(null);
    try {
      if (seguradoEmEdicao?.id) {
        await atualizarMutation.mutateAsync({
          id: seguradoEmEdicao.id,
          dto: dto as SeguradoUpdateRequest,
        });
      } else {
        await criarMutation.mutateAsync(dto as SeguradoRequest);
      }
      handleFecharModal();
    } catch (err: unknown) {
      console.error("Erro ao salvar segurado:", err);
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
          "Não foi possível salvar o segurado. Verifique os dados ou a conexão com o servidor.",
        );
      }
    }
  };

  const isSaving = criarMutation.isPending || atualizarMutation.isPending;
  const segurados = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-(--accent-ink) font-semibold">
            cadastro
          </div>
          <h1 className="text-2xl font-bold text-(--fg)">Segurados</h1>
          <p className="text-sm text-(--muted) mt-0.5">
            Pessoas físicas e jurídicas com contrato ativo ou histórico.
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
          Novo Segurado
        </Button>
      </div>

      {/* Modal Reutilizável com Formulário */}
      <Modal
        isOpen={modalAberto}
        onClose={handleFecharModal}
        title={seguradoEmEdicao ? "Editar Segurado" : "Novo Segurado"}
        description={
          seguradoEmEdicao
            ? "Atualize as informações cadastrais do segurado."
            : "Preencha os dados abaixo para cadastrar um novo segurado no sistema."
        }
      >
        <SeguradoForm
          seguradoInicial={seguradoEmEdicao}
          onSubmit={handleSalvarSegurado}
          onCancel={handleFecharModal}
          isLoading={isSaving}
          errorMessage={formError}
        />
      </Modal>

      {/* Filtros */}
      <SeguradoFilters
        key={nome}
        onSearch={handleSearch}
        isLoading={isLoading}
        initialTermo={nome}
      />

      {/* Mensagem de Erro de Carga */}
      {isError && (
        <div className="p-4 rounded-lg bg-(--danger-soft) border border-rose-200 text-(--danger) text-sm">
          Ocorreu um erro ao carregar os segurados. Verifique se o serviço
          backend está ativo e tente novamente.
        </div>
      )}

      {/* Tabela de Segurados */}
      <SeguradoTable
        segurados={segurados}
        isLoading={isLoading}
        onEditar={handleEditar}
        onVisualizar={handleVisualizar}
      />

      {!isLoading && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={size}
          onPageChange={setPage}
        />
      )}

      <SeguradoDetailDrawer
        segurado={seguradoParaDetalhes}
        isOpen={Boolean(seguradoParaDetalhes)}
        onClose={handleFecharDetalhes}
      />
    </div>
  );
};
