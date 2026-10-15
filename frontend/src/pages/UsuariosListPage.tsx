import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
  SearchInput,
  TableContainer,
  TableHeader,
  TableRow,
  ToastNotification,
} from "../components/ui";
import { useAuth } from "../context/useAuth";
import {
  CriarUsuarioModal,
  UsuarioCredenciaisModal,
  useInativarUsuario,
  useReativarUsuario,
  useUsuarios,
} from "../features/auth";
import type { UsuarioCriadoResponse } from "../interfaces/auth/usuario";
import type { PapelUsuario } from "../interfaces/enums";
import { extrairMensagemErro } from "../utils/errorUtils";
import { formatarData } from "../utils/formatters";

const OPCOES_PAPEL = [
  { id: "TODOS", label: "Todos" },
  { id: "ADMIN", label: "Admin" },
  { id: "GESTOR", label: "Gestor" },
  { id: "ANALISTA", label: "Analista" },
] as const;

const OPCOES_STATUS = [
  { id: "TODOS", label: "Todos" },
  { id: "ATIVOS", label: "Ativos" },
  { id: "INATIVOS", label: "Inativos" },
] as const;

export const UsuariosListPage: React.FC = () => {
  const { usuario: usuarioLogado } = useAuth();
  const { data: usuarios, isLoading, isError, refetch } = useUsuarios();

  const inativarMutation = useInativarUsuario();
  const reativarMutation = useReativarUsuario();

  const [busca, setBusca] = useState("");
  const [filtroPapel, setFiltroPapel] = useState<string>("TODOS");
  const [filtroStatus, setFiltroStatus] = useState<"TODOS" | "ATIVOS" | "INATIVOS">(
    "TODOS",
  );

  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [usuarioParaInativar, setUsuarioParaInativar] = useState<{
    id: string;
    nome: string;
    email: string;
    papel: string;
  } | null>(null);

  const [credenciaisCriadas, setCredenciaisCriadas] = useState<{
    nome: string;
    email: string;
    papel: string;
    senhaPlana: string;
  } | null>(null);

  const [toastInfo, setToastInfo] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
    variant: "success" | "info" | "warning" | "error";
  } | null>(null);

  const podeCadastrar =
    usuarioLogado?.papel === "ADMIN" || usuarioLogado?.papel === "GESTOR";

  const usuariosFiltrados = useMemo(() => {
    if (!usuarios) return [];
    return usuarios.filter((u) => {
      // Esta tela gerencia apenas colaboradores internos; segurados pertencem ao módulo de clientes
      if (u.papel === "SEGURADO") return false;

      // Filtro de busca
      const termo = busca.toLowerCase().trim();
      const bateTermo =
        !termo ||
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo);

      // Filtro de papel
      const batePapel = filtroPapel === "TODOS" || u.papel === filtroPapel;

      // Filtro de status
      const ativo = u.ativo !== false; // default true se omitido
      const bateStatus =
        filtroStatus === "TODOS" ||
        (filtroStatus === "ATIVOS" && ativo) ||
        (filtroStatus === "INATIVOS" && !ativo);

      return bateTermo && batePapel && bateStatus;
    });
  }, [usuarios, busca, filtroPapel, filtroStatus]);

  const handleSucessoCriacao = (
    criado: UsuarioCriadoResponse,
    senhaPlana: string,
  ) => {
    setCredenciaisCriadas({
      nome: criado.nome,
      email: criado.email,
      papel: criado.papel,
      senhaPlana,
    });
    setToastInfo({
      isOpen: true,
      title: "Usuário cadastrado com sucesso",
      message: `${criado.nome} (${criado.papel}) foi adicionado à plataforma.`,
      variant: "success",
    });
  };

  const handleConfirmarInativacao = async () => {
    if (!usuarioParaInativar) return;
    const { id, nome } = usuarioParaInativar;
    try {
      await inativarMutation.mutateAsync(id);
      setUsuarioParaInativar(null);
      setToastInfo({
        isOpen: true,
        title: "Acesso inativado",
        message: `O acesso corporativo de ${nome} foi suspenso.`,
        variant: "warning",
      });
    } catch (err) {
      setToastInfo({
        isOpen: true,
        title: "Falha ao inativar usuário",
        message: extrairMensagemErro(err),
        variant: "error",
      });
    }
  };

  const handleReativar = async (id: string, nome: string) => {
    try {
      await reativarMutation.mutateAsync(id);
      setToastInfo({
        isOpen: true,
        title: "Usuário reativado",
        message: `O acesso de ${nome} foi restaurado com sucesso.`,
        variant: "success",
      });
    } catch (err) {
      setToastInfo({
        isOpen: true,
        title: "Falha ao reativar usuário",
        message: extrairMensagemErro(err),
        variant: "error",
      });
    }
  };

  const getPapelBadgeVariant = (papel: PapelUsuario) => {
    switch (papel) {
      case "ADMIN":
        return "purple";
      case "GESTOR":
        return "info";
      case "ANALISTA":
        return "success";
      case "SEGURADO":
      default:
        return "neutral";
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--fg)">
            Gestão de Usuários
          </h1>
          <p className="text-sm text-(--muted) mt-1">
            Controle de acesso, credenciais e papéis corporativos da seguradora.
          </p>
        </div>

        {podeCadastrar && (
          <Button
            variant="primary"
            onClick={() => setModalCriarAberto(true)}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            {usuarioLogado?.papel === "ADMIN"
              ? "Novo Gestor / Analista"
              : "Novo Analista"}
          </Button>
        )}
      </div>

      {/* Barra de Filtros e Busca Redesenhada */}
      <div className="bg-(--surface) p-3.5 sm:p-4 rounded-(--radius) border border-(--border) shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
        <div className="w-full xl:max-w-sm">
          <SearchInput
            placeholder="Buscar por nome ou e-mail..."
            value={busca}
            onValueChange={setBusca}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Segmented Control - Papel */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-(--muted)">
              Papel:
            </span>
            <div className="inline-flex p-0.5 rounded-lg bg-(--surface-2) border border-(--border)">
              {OPCOES_PAPEL.map(({ id, label }) => {
                const ativo = filtroPapel === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFiltroPapel(id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      ativo
                        ? "bg-(--surface) text-(--fg) font-semibold shadow-xs border border-(--border-strong)/50"
                        : "text-(--muted) hover:text-(--fg) hover:bg-(--surface)/50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-4 w-px bg-(--border) hidden sm:block" />

          {/* Segmented Control - Status */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-(--muted)">
              Status:
            </span>
            <div className="inline-flex p-0.5 rounded-lg bg-(--surface-2) border border-(--border)">
              {OPCOES_STATUS.map(({ id, label }) => {
                const ativo = filtroStatus === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFiltroStatus(id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      ativo
                        ? "bg-(--surface) text-(--fg) font-semibold shadow-xs border border-(--border-strong)/50"
                        : "text-(--muted) hover:text-(--fg) hover:bg-(--surface)/50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Limpar filtros */}
          {(busca || filtroPapel !== "TODOS" || filtroStatus !== "TODOS") && (
            <button
              type="button"
              onClick={() => {
                setBusca("");
                setFiltroPapel("TODOS");
                setFiltroStatus("TODOS");
              }}
              className="text-xs text-(--muted) hover:text-(--accent-ink) font-medium underline underline-offset-2 transition-colors cursor-pointer ml-auto sm:ml-0"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo: Loading / Erro / Vazio / Tabela */}
      {isLoading ? (
        <LoadingState message="Carregando usuários do sistema..." />
      ) : isError ? (
        <ErrorState
          title="Erro ao carregar lista de usuários"
          message="Não foi possível obter os usuários cadastrados no serviço de autenticação."
          onRetry={() => refetch()}
        />
      ) : usuariosFiltrados.length === 0 ? (
        <EmptyState
          title="Nenhum usuário encontrado"
          description={
            busca || filtroPapel !== "TODOS" || filtroStatus !== "TODOS"
              ? "Tente ajustar os filtros de busca para encontrar os registros."
              : "Nenhum usuário cadastrado além das contas padrão."
          }
          action={
            podeCadastrar && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setModalCriarAberto(true)}
              >
                Cadastrar primeiro usuário
              </Button>
            )
          }
        />
      ) : (
        <TableContainer>
          <TableHeader
            columns={[
              { label: "Usuário", align: "center" },
              { label: "E-mail", align: "center" },
              { label: "Papel de Acesso", align: "left" },
              { label: "Status", align: "center" },
              { label: "Cadastrado em", align: "left" },
              { label: "Ações", align: "center" },
            ]}
          />
          <tbody>
            {usuariosFiltrados.map((u) => {
              const ativo = u.ativo !== false;
              const isRootAdmin = u.papel === "ADMIN";
              const isMesmoUsuario = u.id === usuarioLogado?.id;
              const podeModificarStatus =
                podeCadastrar && !isRootAdmin && !isMesmoUsuario;

              return (
                <TableRow key={u.id}>
                  {/* Nome e Avatar */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-(--surface-2) border border-(--border) flex items-center justify-center font-semibold text-xs text-(--fg)">
                        {u.nome
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((n) => n[0].toUpperCase())
                          .join("") || "US"}
                      </div>
                      <div>
                        <div className="font-medium text-(--fg) text-sm">
                          {u.nome}
                        </div>
                        {isMesmoUsuario && (
                          <span className="text-[10px] text-(--accent-ink) font-semibold uppercase">
                            (Você)
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 whitespace-nowrap text-(--muted) font-mono text-xs">
                    {u.email}
                  </td>

                  {/* Papel */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getPapelBadgeVariant(u.papel)}>
                      {u.papel}
                    </Badge>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={ativo ? "success" : "danger"}>
                      {ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>

                  {/* Data de Cadastro */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-(--muted)">
                    {u.createdAt ? formatarData(u.createdAt) : ""}
                  </td>

                  {/* Ações */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {podeModificarStatus ? (
                      ativo ? (
                        <button
                          type="button"
                          disabled={
                            inativarMutation.isPending &&
                            usuarioParaInativar?.id === u.id
                          }
                          onClick={() =>
                            setUsuarioParaInativar({
                              id: u.id,
                              nome: u.nome,
                              email: u.email,
                              papel: u.papel,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/5 hover:bg-red-500/10 active:bg-red-500/15 border border-red-500/20 hover:border-red-500/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                          title={`Inativar acesso de ${u.nome}`}
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
                          <span>Inativar</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={reativarMutation.isPending}
                          onClick={() => handleReativar(u.id, u.nome)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-(--accent-ink) bg-(--accent-soft)/40 hover:bg-(--accent-soft) active:bg-(--accent-soft)/80 border border-(--accent)/30 hover:border-(--accent) transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                          title={`Reativar acesso de ${u.nome}`}
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
                          <span>Reativar</span>
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-(--faint)">—</span>
                    )}
                  </td>
                </TableRow>
              );
            })}
          </tbody>
        </TableContainer>
      )}

      {/* Modal para criar novo usuário */}
      <CriarUsuarioModal
        isOpen={modalCriarAberto}
        onClose={() => setModalCriarAberto(false)}
        onSuccess={handleSucessoCriacao}
      />

      {/* Modal de confirmação de inativação */}
      {usuarioParaInativar && (
        <Modal
          isOpen={true}
          onClose={() => setUsuarioParaInativar(null)}
          title="Inativar Acesso do Colaborador"
          description="A suspensão do acesso bloqueará imediatamente logins e operações desta conta."
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
                Tem certeza que deseja inativar o acesso de{" "}
                <strong className="text-(--fg)">
                  {usuarioParaInativar.nome}
                </strong>
                ? O colaborador não conseguirá mais efetuar login.
              </p>
              <div className="p-2.5 rounded bg-(--surface) border border-(--border) text-[11px] font-mono text-(--muted) space-y-1">
                <div>
                  E-mail:{" "}
                  <span className="text-(--fg) font-semibold">
                    {usuarioParaInativar.email}
                  </span>
                </div>
                <div>
                  Papel:{" "}
                  <span className="text-(--fg) font-semibold">
                    {usuarioParaInativar.papel}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-(--border)">
              <Button
                variant="secondary"
                onClick={() => setUsuarioParaInativar(null)}
                disabled={inativarMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmarInativacao}
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

      {/* Modal de confirmação com credenciais geradas */}
      {credenciaisCriadas && (
        <UsuarioCredenciaisModal
          isOpen={true}
          onClose={() => setCredenciaisCriadas(null)}
          nome={credenciaisCriadas.nome}
          email={credenciaisCriadas.email}
          papel={credenciaisCriadas.papel}
          senhaPlana={credenciaisCriadas.senhaPlana}
        />
      )}

      {/* Toast de notificação */}
      {toastInfo && (
        <ToastNotification
          isOpen={toastInfo.isOpen}
          title={toastInfo.title}
          message={toastInfo.message}
          variant={toastInfo.variant}
          onClose={() => setToastInfo(null)}
        />
      )}
    </div>
  );
};

