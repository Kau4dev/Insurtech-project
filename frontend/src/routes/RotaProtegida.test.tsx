import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { RotaProtegida } from "./RotaProtegida";

const mockUseAuth = vi.fn();

vi.mock("../context/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("RotaProtegida", () => {
  it("deve exibir tela de validação quando isLoading for true", () => {
    mockUseAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      usuario: null,
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

  it("deve exibir Acesso Restrito se o papel do usuário não for permitido", () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      usuario: { id: "u1", nome: "Analista", papel: "ANALISTA" },
    });

    render(
      <MemoryRouter>
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
});
