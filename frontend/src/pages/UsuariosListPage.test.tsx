import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsuariosListPage } from "./UsuariosListPage";

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
];

vi.mock("../features/auth", () => ({
  useUsuarios: () => ({
    data: mockUsuarios,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useInativarUsuario: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useReativarUsuario: () => ({
    mutateAsync: vi.fn(),
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

  it("deve renderizar o título da página e a lista de usuários", () => {
    renderWithClient(<UsuariosListPage />);

    expect(screen.getByText("Gestão de Usuários")).toBeInTheDocument();
    expect(screen.getByText("Admin Root")).toBeInTheDocument();
    expect(screen.getByText("Ana Gestora")).toBeInTheDocument();
    expect(screen.getByText("Bruno Analista")).toBeInTheDocument();
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


  it("deve abrir o modal de criação ao clicar no botão 'Novo Gestor / Analista'", () => {
    renderWithClient(<UsuariosListPage />);

    const btnNovo = screen.getByRole("button", {
      name: /Novo Gestor \/ Analista/i,
    });
    fireEvent.click(btnNovo);

    expect(screen.getByText("Modal de Cadastro Aberta")).toBeInTheDocument();
  });
});

