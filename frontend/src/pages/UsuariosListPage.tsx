import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
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

  const handleInativar = async (id: string, nome: string) => {
    if (
      !window.confirm(
        `Deseja realmente inativar o acesso de ${nome}? O usuário não conseguirá mais efetuar login.`,
      )
    ) {
      return;
    }
    try {
      await inativarMutation.mutateAsync(id);
      setToastInfo({
        isOpen: true,
        title: "Usuário inativado",
        message: `O acesso de ${nome} foi suspenso.`,
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

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-(--surface) p-4 rounded-(--radius) border border-(--border)">
        <div className="w-full md:w-80">
          <SearchInput
            placeholder="Buscar por nome ou e-mail..."
            value={busca}
            onValueChange={setBusca}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro de Papel */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-(--muted) mr-1 font-medium">Papel:</span>
            {(["TODOS", "ADMIN", "GESTOR", "ANALISTA", "SEGURADO"] as const).map(
              (p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFiltroPapel(p)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    filtroPapel === p
                      ? "bg-(--accent-soft) text-(--accent-ink) font-semibold"
                      : "text-(--muted) hover:bg-(--surface-2) hover:text-(--fg)"
                  }`}
                >
                  {p === "TODOS" ? "Todos" : p}
                </button>
              ),
            )}
          </div>

          <div className="h-4 w-px bg-(--border) hidden sm:block mx-1" />

          {/* Filtro de Status */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-(--muted) mr-1 font-medium">Status:</span>
            {(["TODOS", "ATIVOS", "INATIVOS"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFiltroStatus(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  filtroStatus === s
                    ? "bg-(--accent-soft) text-(--accent-ink) font-semibold"
                    : "text-(--muted) hover:bg-(--surface-2) hover:text-(--fg)"
                }`}
              >
                {s === "TODOS" ? "Todos" : s === "ATIVOS" ? "Ativos" : "Inativos"}
              </button>
            ))}
          </div>
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
              { label: "Usuário" },
              { label: "E-mail" },
              { label: "Papel de Acesso" },
              { label: "Status" },
              { label: "Cadastrado em" },
              { label: "Ações", align: "right" },
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
                    {u.createdAt ? formatarData(u.createdAt) : "—"}
                  </td>

                  {/* Ações */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {podeModificarStatus ? (
                      ativo ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-500/10"
                          disabled={inativarMutation.isPending}
                          onClick={() => handleInativar(u.id, u.nome)}
                        >
                          Inativar
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={reativarMutation.isPending}
                          onClick={() => handleReativar(u.id, u.nome)}
                        >
                          Reativar
                        </Button>
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

