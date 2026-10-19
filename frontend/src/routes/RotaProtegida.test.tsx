import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RotaProtegida } from "./RotaProtegida";

const mockUseAuth = vi.fn();
const mockLogout = vi.fn();

vi.mock("../context/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("RotaProtegida", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve exibir tela de validação quando isLoading for true", () => {
    mockUseAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      usuario: null,
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <RotaProtegida>
          <div>Conteúdo Protegido</div>
        </RotaProtegida>
      </MemoryRouter>,
    );

    expect(screen.getByText("Validando sessão...")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo Protegido")).not.toBeInTheDocument();
  });

  it("deve redirecionar para /login se não estiver autenticado", () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      usuario: null,
      logout: mockLogout,
    });

    render(
      <MemoryRouter initialEntries={["/privado"]}>
        <Routes>
          <Route
            path="/privado"
            element={
              <RotaProtegida>
                <div>Conteúdo Secreto</div>
              </RotaProtegida>
            }
          />
          <Route path="/login" element={<div>Página de Login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Página de Login")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo Secreto")).not.toBeInTheDocument();
  });

  it("deve exibir Acesso Restrito se o papel do usuário interno não for permitido para a rota específica", () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      usuario: { id: "u1", nome: "Analista", papel: "ANALISTA" },
      logout: mockLogout,
    });

    render(
      <MemoryRouter initialEntries={["/usuarios"]}>
        <RotaProtegida papeisPermitidos={["ADMIN", "GESTOR"]}>
          <div>Área Administrativa</div>
        </RotaProtegida>
      </MemoryRouter>,
    );

    expect(screen.getByText("Acesso Restrito")).toBeInTheDocument();
    expect(screen.queryByText("Área Administrativa")).not.toBeInTheDocument();
  });

  it("deve renderizar children quando autenticado e com permissão", () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      usuario: { id: "u1", nome: "Gestor", papel: "GESTOR" },
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <RotaProtegida papeisPermitidos={["ADMIN", "GESTOR"]}>
          <div>Área Permitida</div>
        </RotaProtegida>
      </MemoryRouter>,
    );

    expect(screen.getByText("Área Permitida")).toBeInTheDocument();
  });

  it("deve redirecionar para /portal/login se não autenticado em rota do portal", () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      usuario: null,
      logout: mockLogout,
    });

    render(
      <MemoryRouter initialEntries={["/portal/apolices"]}>
        <Routes>
          <Route
            path="/portal/apolices"
            element={
              <RotaProtegida papeisPermitidos={["SEGURADO"]}>
                <div>Apólices do Segurado</div>
              </RotaProtegida>
            }
          />
          <Route path="/portal/login" element={<div>Login do Portal</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login do Portal")).toBeInTheDocument();
    expect(screen.queryByText("Apólices do Segurado")).not.toBeInTheDocument();
  });

  it("deve redirecionar SEGURADO para /portal sem disparar logout ao tentar acessar rota interna", () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      usuario: { id: "seg-1", nome: "Segurado", papel: "SEGURADO" },
      logout: mockLogout,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <RotaProtegida papeisPermitidos={["ADMIN", "GESTOR", "ANALISTA"]}>
                <div>Dashboard Interno</div>
              </RotaProtegida>
            }
          />
          <Route path="/portal" element={<div>Portal do Segurado</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Portal do Segurado")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard Interno")).not.toBeInTheDocument();
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it("deve redirecionar usuário interno para /dashboard sem disparar logout ao tentar acessar /portal", () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      usuario: { id: "adm-1", nome: "Admin", papel: "ADMIN" },
      logout: mockLogout,
    });

    render(
      <MemoryRouter initialEntries={["/portal"]}>
        <Routes>
          <Route
            path="/portal"
            element={
              <RotaProtegida papeisPermitidos={["SEGURADO"]}>
                <div>Portal do Segurado</div>
              </RotaProtegida>
            }
          />
          <Route path="/dashboard" element={<div>Dashboard Interno</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Dashboard Interno")).toBeInTheDocument();
    expect(screen.queryByText("Portal do Segurado")).not.toBeInTheDocument();
    expect(mockLogout).not.toHaveBeenCalled();
  });
});
