import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";
import { AtribuirAnalistaModal } from "./AtribuirAnalistaModal";

const mockUsuario = {
  id: "8d6d4a5e-4abd-49a6-b388-7c70de10c3e4",
  nome: "Carlos Analista",
  email: "carlos@insurtech.com",
  papel: "ANALISTA" as const,
  ativo: true,
};

vi.mock("../../../context/useAuth", () => ({
  useAuth: () => ({
    usuario: mockUsuario,
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
});
