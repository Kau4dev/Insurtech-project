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

  it("deve exibir validação de estado em tempo real para email inválido e corrigir quando válido", async () => {
    renderWithClient(
      <CriarUsuarioModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    const inputEmail = screen.getByLabelText(/E-mail Corporativo/i);

    // Digita e-mail incompleto/inválido como no print do usuário ("carlosTeste@")
    fireEvent.change(inputEmail, { target: { value: "carlosTeste@" } });

    await waitFor(() => {
      expect(screen.getByText("Formato de e-mail inválido")).toBeInTheDocument();
      expect(inputEmail).toHaveAttribute("aria-invalid", "true");
    });

    // Corrige para e-mail corporativo válido
    fireEvent.change(inputEmail, { target: { value: "carlos.silva@insurtech.com" } });

    await waitFor(() => {
      expect(screen.queryByText("Formato de e-mail inválido")).not.toBeInTheDocument();
      expect(inputEmail).toHaveAttribute("aria-invalid", "false");
    });
  });

  it("deve validar tamanho mínimo de nome e senha em tempo real", async () => {
    renderWithClient(
      <CriarUsuarioModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    const inputNome = screen.getByLabelText(/Nome Completo/i);
    const inputSenha = screen.getByPlaceholderText(/Mínimo 8 caracteres/i);

    fireEvent.change(inputNome, { target: { value: "a" } });
    fireEvent.change(inputSenha, { target: { value: "123" } });

    await waitFor(() => {
      expect(screen.getByText("Nome deve ter no mínimo 2 caracteres")).toBeInTheDocument();
      expect(screen.getByText("Senha deve ter no mínimo 8 caracteres")).toBeInTheDocument();
    });
  });
});

