import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PortalLayout } from "./PortalLayout";

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../../context/useAuth", () => ({
  useAuth: () => ({
    usuario: {
      id: "segurado-1",
      nome: "João Segurado",
      email: "joao.segurado@email.com",
      papel: "SEGURADO",
    },
    logout: mockLogout,
  }),
}));

function renderLayout(initialEntries = ["/portal"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <PortalLayout />
    </MemoryRouter>
  );
}

describe("PortalLayout Header & Responsive Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar a marca InsurTech, badge do portal e links principais", () => {
    renderLayout();

    expect(screen.getByText("InsurTech")).toBeInTheDocument();
    expect(screen.getByText("Portal do Segurado")).toBeInTheDocument();
    expect(screen.getByText("Início")).toBeInTheDocument();
    expect(screen.getByText("Minhas Apólices")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /abrir novo sinistro/i }),
    ).toBeInTheDocument();
  });

  it("deve abrir o dropdown do usuário ao clicar no perfil e permitir logout", () => {
    renderLayout();

    // Encontra o botão do usuário pelo nome ou avatar
    const btnUsuario = screen.getByRole("button", { name: /João Segurado/i });
    fireEvent.click(btnUsuario);

    // Dropdown deve ser exibido com detalhes
    expect(screen.getByText("Conta Verificada")).toBeInTheDocument();
    expect(screen.getByText("joao.segurado@email.com")).toBeInTheDocument();

    // Clica em 'Sair da Conta'
    const btnSair = screen.getByRole("button", { name: /Sair da Conta/i });
    fireEvent.click(btnSair);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/portal/login");
  });

  it("deve abrir o menu drawer mobile ao clicar no botão hambúrguer", () => {
    renderLayout();

    const btnHamburguer = screen.getByLabelText(/Abrir menu de navegação/i);
    fireEvent.click(btnHamburguer);

    // Menu mobile deve abrir com o diálogo de navegação
    expect(
      screen.getByRole("dialog", {
        name: /Navegação móvel do portal do segurado/i,
      })
    ).toBeInTheDocument();

    // Deve exibir card do segurado conectado e central 24h
    expect(
      screen.getByText("Portal do Segurado • Conectado")
    ).toBeInTheDocument();
    expect(screen.getByText("Central de Atendimento 24h")).toBeInTheDocument();
    expect(screen.getByText("Abrir Novo Sinistro")).toBeInTheDocument();

    // Fecha o menu ao clicar no botão de fechar
    const btnFechar = screen.getByLabelText(/Fechar menu de navegação/i);
    fireEvent.click(btnFechar);

    expect(
      screen.queryByRole("dialog", {
        name: /Navegação móvel do portal do segurado/i,
      })
    ).not.toBeInTheDocument();
  });
});

