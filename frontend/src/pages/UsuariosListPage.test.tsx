import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsuariosListPage } from "./UsuariosListPage";

const mockInativarMutateAsync = vi.fn();
const mockReativarMutateAsync = vi.fn();

const mockUsuarios = [
  {
    id: "admin-1",
    nome: "Admin Root",
    email: "admin@insurtech.com",
    papel: "ADMIN" as const,
    ativo: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "gestor-1",
    nome: "Ana Gestora",
    email: "ana@insurtech.com",
    papel: "GESTOR" as const,
    ativo: true,
    createdAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "analista-1",
    nome: "Bruno Analista",
    email: "bruno@insurtech.com",
    papel: "ANALISTA" as const,
    ativo: false,
    createdAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "segurado-1",
    nome: "Carlos Segurado",
    email: "carlos@cliente.com",
    papel: "SEGURADO" as const,
    ativo: true,
    createdAt: "2026-04-01T00:00:00Z",
  },
];

vi.mock("../features/auth", () => ({
  useUsuarios: () => ({
    data: mockUsuarios,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useInativarUsuario: () => ({
    mutateAsync: mockInativarMutateAsync,
    isPending: false,
  }),
  useReativarUsuario: () => ({
    mutateAsync: mockReativarMutateAsync,
    isPending: false,
  }),
  useCadastrarUsuario: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  CriarUsuarioModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div>Modal de Cadastro Aberta</div> : null,
  UsuarioCredenciaisModal: () => null,
}));

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({
    usuario: {
      id: "admin-1",
      nome: "Admin Root",
      email: "admin@insurtech.com",
      papel: "ADMIN",
    },
  }),
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("UsuariosListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o título da página e a lista de colaboradores internos excluindo SEGURADO", () => {
    renderWithClient(<UsuariosListPage />);

    expect(screen.getByText("Gestão de Usuários")).toBeInTheDocument();
    expect(screen.getByText("Admin Root")).toBeInTheDocument();
    expect(screen.getByText("Ana Gestora")).toBeInTheDocument();
    expect(screen.getByText("Bruno Analista")).toBeInTheDocument();

    // Carlos Segurado não deve aparecer pois segurados são gerenciados na área de clientes
    expect(screen.queryByText("Carlos Segurado")).not.toBeInTheDocument();
    expect(screen.queryByText("carlos@cliente.com")).not.toBeInTheDocument();
  });

  it("não deve exibir a opção 'Segurado' no filtro de papel", () => {
    renderWithClient(<UsuariosListPage />);

    // Deve conter botões para papéis internos
    expect(screen.getByRole("button", { name: "Admin" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gestor" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analista" })).toBeInTheDocument();

    // Não deve existir opção de filtro 'Segurado'
    expect(screen.queryByRole("button", { name: "Segurado" })).not.toBeInTheDocument();
  });

  it("deve filtrar a listagem pelo campo de busca", () => {
    renderWithClient(<UsuariosListPage />);

    const inputBusca = screen.getByPlaceholderText(
      /Buscar por nome ou e-mail/i,
    );
    fireEvent.change(inputBusca, { target: { value: "Ana Gestora" } });

    expect(screen.getByText("Ana Gestora")).toBeInTheDocument();
    expect(screen.queryByText("Bruno Analista")).not.toBeInTheDocument();
  });

  it("deve filtrar por papel ao clicar nos botões segmented control", () => {
    renderWithClient(<UsuariosListPage />);

    const btnGestor = screen.getByRole("button", { name: "Gestor" });
    fireEvent.click(btnGestor);

    expect(screen.getByText("Ana Gestora")).toBeInTheDocument();
    expect(screen.queryByText("Admin Root")).not.toBeInTheDocument();
    expect(screen.queryByText("Bruno Analista")).not.toBeInTheDocument();
  });

  it("deve abrir o modal de confirmação ao clicar em Inativar e executar a inativação", async () => {
    mockInativarMutateAsync.mockResolvedValue({});
    renderWithClient(<UsuariosListPage />);

    // Admin Root não pode ser inativado (isRootAdmin / isMesmoUsuario)
    // O primeiro botão Inativar disponível pertence a Ana Gestora (gestor-1)
    const btnsInativar = screen.getAllByRole("button", { name: /Inativar/i });
    expect(btnsInativar.length).toBe(1);

    fireEvent.click(btnsInativar[0]);

    // Modal de confirmação deve ser exibido com detalhes de Ana Gestora
    expect(
      screen.getByText("Inativar Acesso do Colaborador"),
    ).toBeInTheDocument();
    expect(screen.getByText("Confirmação de suspensão")).toBeInTheDocument();
    expect(screen.getAllByText("ana@insurtech.com").length).toBe(2);

    // Confirmar a inativação
    const btnConfirmar = screen.getByRole("button", {
      name: "Confirmar Inativação",
    });
    fireEvent.click(btnConfirmar);

    expect(mockInativarMutateAsync).toHaveBeenCalledWith("gestor-1");
  });

  it("deve abrir o modal de criação ao clicar no botão 'Novo Gestor / Analista'", () => {
    renderWithClient(<UsuariosListPage />);

    const btnNovo = screen.getByRole("button", {
      name: /Novo Gestor \/ Analista/i,
    });
    fireEvent.click(btnNovo);

    expect(screen.getByText("Modal de Cadastro Aberta")).toBeInTheDocument();
  });
});

