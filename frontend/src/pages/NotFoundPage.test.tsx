import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundPage } from "./NotFoundPage";

const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../context/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("NotFoundPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar a página 404 com identidade visual institucional", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      usuario: null,
    });

    render(
      <MemoryRouter initialEntries={["/rota-inexistente"]}>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Página não encontrada")).toBeInTheDocument();
    expect(screen.getByText("Recurso não localizado")).toBeInTheDocument();
    expect(screen.getByText("HTTP 404")).toBeInTheDocument();
    expect(screen.getByText("/rota-inexistente")).toBeInTheDocument();
    expect(screen.getByText("Acessar Painel Corporativo →")).toBeInTheDocument();
    expect(screen.getByText("Portal do Segurado")).toBeInTheDocument();
  });

  it("deve exibir botão de retorno ao Dashboard quando usuário for colaborador interno", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      usuario: { id: "u1", nome: "Analista", papel: "ANALISTA" },
    });

    render(
      <MemoryRouter initialEntries={["/dashboard/pagina-fantasma"]}>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Voltar ao Dashboard Operacional →")).toBeInTheDocument();
    expect(screen.getByText("Sinistros")).toBeInTheDocument();
    expect(screen.getByText("Apólices")).toBeInTheDocument();
    expect(screen.getByText("Segurados")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Voltar ao Dashboard Operacional →"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("deve exibir botão de retorno ao Portal do Segurado quando usuário for SEGURADO", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      usuario: { id: "seg-1", nome: "João Segurado", papel: "SEGURADO" },
    });

    render(
      <MemoryRouter initialEntries={["/portal/sinistro-inexistente"]}>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Ir para o Portal do Segurado →")).toBeInTheDocument();
    expect(screen.queryByText("Voltar ao Dashboard Operacional →")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Ir para o Portal do Segurado →"));
    expect(mockNavigate).toHaveBeenCalledWith("/portal");
  });

  it("deve navegar para a página anterior ao clicar em 'Voltar à anterior'", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      usuario: null,
    });

    render(
      <MemoryRouter initialEntries={["/rota-aleatoria"]}>
        <NotFoundPage />
      </MemoryRouter>,
    );

    const btnVoltar = screen.getByText("← Voltar à anterior");
    fireEvent.click(btnVoltar);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
