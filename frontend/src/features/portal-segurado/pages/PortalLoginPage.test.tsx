import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PortalLoginPage } from "./PortalLoginPage";

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../../../context/useAuth", () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    usuario: null,
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("PortalLoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar a interface do Portal do Segurado", () => {
    render(
      <MemoryRouter>
        <PortalLoginPage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText(/Portal do Segurado/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Seu e-mail de segurado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sua senha/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Acessar Portal do Segurado/i }),
    ).toBeInTheDocument();
  });

  it("deve conter link para o Painel Corporativo", () => {
    render(
      <MemoryRouter>
        <PortalLoginPage />
      </MemoryRouter>,
    );

    const linkCorporativo = screen.getByRole("link", {
      name: /Acessar Painel Corporativo/i,
    });
    expect(linkCorporativo).toBeInTheDocument();
    expect(linkCorporativo).toHaveAttribute("href", "/login");
  });

  it("deve preencher credenciais ao clicar no botão de demonstração do segurado", () => {
    render(
      <MemoryRouter>
        <PortalLoginPage />
      </MemoryRouter>,
    );

    const btnDemo = screen.getByText(/Segurado \(João Silva\)/i);
    fireEvent.click(btnDemo);

    const inputEmail = screen.getByLabelText(
      /Seu e-mail de segurado/i,
    ) as HTMLInputElement;
    const inputSenha = screen.getByLabelText(/Sua senha/i) as HTMLInputElement;

    expect(inputEmail.value).toBe("joao@email.com");
    expect(inputSenha.value).toBe("password");
  });

  it("deve chamar login e navegar para /portal ao autenticar segurado", async () => {
    mockLogin.mockResolvedValueOnce({
      id: "segurado-user-1",
      nome: "João Silva",
      email: "joao@email.com",
      papel: "SEGURADO",
    });

    render(
      <MemoryRouter>
        <PortalLoginPage />
      </MemoryRouter>,
    );

    const btnDemo = screen.getByText(/Segurado \(João Silva\)/i);
    fireEvent.click(btnDemo);

    const btnEntrar = screen.getByRole("button", {
      name: /Acessar Portal do Segurado/i,
    });
    fireEvent.click(btnEntrar);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "joao@email.com",
        senha: "password",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/portal", { replace: true });
    });
  });
});
