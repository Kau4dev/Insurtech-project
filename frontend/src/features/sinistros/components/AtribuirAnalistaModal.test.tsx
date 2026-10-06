import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";
import type { Usuario } from "../../../interfaces/auth/usuario";
import { AtribuirAnalistaModal } from "./AtribuirAnalistaModal";

const mockUsuarioAnalista: Usuario = {
  id: "8d6d4a5e-4abd-49a6-b388-7c70de10c3e4",
  nome: "Carlos Analista",
  email: "carlos@insurtech.com",
  papel: "ANALISTA",
};

const mockUsuarioGestor: Usuario = {
  id: "a77a2f35-60f3-46af-958b-38e57c24cd14",
  nome: "Gestor Silva",
  email: "gestor@insurtech.com",
  papel: "GESTOR",
};

const mockListaUsuarios: Usuario[] = [
  {
    id: "537d81d0-d577-49b0-b4bc-86ee41ce05f5",
    nome: "Admin Master",
    email: "admin@insurtech.com",
    papel: "ADMIN",
  },
  {
    id: "8d6d4a5e-4abd-49a6-b388-7c70de10c3e4",
    nome: "Carlos Analista",
    email: "carlos@insurtech.com",
    papel: "ANALISTA",
  },
  {
    id: "a77a2f35-60f3-46af-958b-38e57c24cd14",
    nome: "Gestor Silva",
    email: "gestor@insurtech.com",
    papel: "GESTOR",
  },
];

let currentUser = mockUsuarioAnalista;

vi.mock("../../../context/useAuth", () => ({
  useAuth: () => ({
    usuario: currentUser,
  }),
}));

vi.mock("../../auth/hooks/useUsuarios", () => ({
  useUsuarios: () => ({
    data: mockListaUsuarios,
    isLoading: false,
  }),
}));

vi.mock("../../apolices/components/ApoliceNumero", () => ({
  ApoliceNumero: () => <span>AP-2026-0001</span>,
}));

vi.mock("../../segurados/components/SeguradoNome", () => ({
  SeguradoNome: () => <span>Segurado Silva</span>,
}));

const sinistroMock: Sinistro = {
  id: "sin-1",
  numeroSinistro: "SIN-2026-0001",
  apoliceId: "ap-1",
  seguradoId: "seg-1",
  status: "REGISTRADO",
  tipoSinistro: "COLISAO",
  descricao: "Batida no portão",
  dataOcorrencia: "2026-09-20T10:00:00Z",
  valorEstimado: 8000,
};

describe("AtribuirAnalistaModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = mockUsuarioAnalista;
  });

  it("deve renderizar modal com fluxo de assumir para perfil ANALISTA", () => {
    render(
      <AtribuirAnalistaModal
        isOpen={true}
        onClose={vi.fn()}
        sinistro={sinistroMock}
        onConfirm={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Assumir Análise do Sinistro"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Confirmar e Assumir/i }),
    ).toBeInTheDocument();
  });

  it("deve submeter o ID do próprio analista ao clicar em confirmar", () => {
    const handleConfirm = vi.fn();

    render(
      <AtribuirAnalistaModal
        isOpen={true}
        onClose={vi.fn()}
        sinistro={sinistroMock}
        onConfirm={handleConfirm}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Confirmar e Assumir/i }),
    );

    expect(handleConfirm).toHaveBeenCalledWith(
      "8d6d4a5e-4abd-49a6-b388-7c70de10c3e4",
    );
  });

  it("deve renderizar dropdown de seleção com nomes dos analistas para perfil GESTOR", () => {
    currentUser = mockUsuarioGestor;
    const handleConfirm = vi.fn();

    render(
      <AtribuirAnalistaModal
        isOpen={true}
        onClose={vi.fn()}
        sinistro={sinistroMock}
        onConfirm={handleConfirm}
      />,
    );

    expect(
      screen.getByText("Atribuir Analista Responsável"),
    ).toBeInTheDocument();

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    // Verifica que as opções mostram analistas e gestores (elegíveis para análise)
    expect(
      screen.getByRole("option", {
        name: /Carlos Analista \(Analista\) - carlos@insurtech\.com/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", {
        name: /Gestor Silva \(Gestor\) - gestor@insurtech\.com/i,
      }),
    ).toBeInTheDocument();

    // Seleciona o analista Carlos
    fireEvent.change(select, {
      target: { value: "8d6d4a5e-4abd-49a6-b388-7c70de10c3e4" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Atribuir Analista/i }),
    );

    expect(handleConfirm).toHaveBeenCalledWith(
      "8d6d4a5e-4abd-49a6-b388-7c70de10c3e4",
    );
  });

  it("deve permitir atribuir a si mesmo através do botão de atalho para perfil GESTOR", () => {
    currentUser = mockUsuarioGestor;
    const handleConfirm = vi.fn();

    render(
      <AtribuirAnalistaModal
        isOpen={true}
        onClose={vi.fn()}
        sinistro={sinistroMock}
        onConfirm={handleConfirm}
      />,
    );

    // Clica em "Atribuir a mim mesmo"
    fireEvent.click(
      screen.getByRole("button", { name: /Atribuir a mim mesmo/i }),
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Atribuir Analista/i }),
    );

    expect(handleConfirm).toHaveBeenCalledWith(
      "a77a2f35-60f3-46af-958b-38e57c24cd14",
    );
  });
});

