import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CriarUsuarioModal } from "./CriarUsuarioModal";

const mockMutateAsync = vi.fn();
vi.mock("../hooks/useUsuarios", () => ({
  useCadastrarUsuario: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

const mockUsuarioLogado = {
  id: "admin-id",
  nome: "Admin Root",
  email: "admin@insurtech.com",
  papel: "ADMIN" as const,
};

vi.mock("../../../context/useAuth", () => ({
  useAuth: () => ({
    usuario: mockUsuarioLogado,
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

describe("CriarUsuarioModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("não deve renderizar quando isOpen for false", () => {
    renderWithClient(
      <CriarUsuarioModal
        isOpen={false}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );
    expect(screen.queryByText(/Cadastrar Novo Usuário/i)).not.toBeInTheDocument();
  });

  it("deve renderizar formulário com campos quando isOpen for true", () => {
    renderWithClient(
      <CriarUsuarioModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.getByText(/Cadastrar Novo Usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail Corporativo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Perfil de Acesso/i)).toBeInTheDocument();
  });

  it("deve gerar senha forte ao clicar no botão 'Gerar senha forte'", () => {
    renderWithClient(
      <CriarUsuarioModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    const btnGerar = screen.getByRole("button", { name: /Gerar senha forte/i });
    fireEvent.click(btnGerar);

    const inputSenha = screen.getByPlaceholderText(/Mínimo 8 caracteres/i) as HTMLInputElement;
    expect(inputSenha.value.length).toBe(12);
  });

  it("deve submeter formulário com dados válidos e acionar onSuccess", async () => {
    const handleSuccess = vi.fn();
    const mockCriado = {
      id: "novo-user-id",
      nome: "Carlos Gestor",
      email: "carlos@insurtech.com",
      papel: "GESTOR" as const,
      ativo: true,
      createdAt: "2026-10-12T10:00:00Z",
    };
    mockMutateAsync.mockResolvedValueOnce(mockCriado);

    renderWithClient(
      <CriarUsuarioModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={handleSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Nome Completo/i), {
      target: { value: "Carlos Gestor" },
    });
    fireEvent.change(screen.getByLabelText(/E-mail Corporativo/i), {
      target: { value: "carlos@insurtech.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Mínimo 8 caracteres/i), {
      target: { value: "SenhaSegura!123" },
    });

    const btnSubmit = screen.getByRole("button", { name: /Cadastrar Usuário/i });
    fireEvent.click(btnSubmit);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        nome: "Carlos Gestor",
        email: "carlos@insurtech.com",
        senha: "SenhaSegura!123",
        papel: "GESTOR",
      });
      expect(handleSuccess).toHaveBeenCalledWith(mockCriado, "SenhaSegura!123");
    });
  });
});

