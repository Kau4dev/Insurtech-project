import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";
import { AprovarRejeitarModal } from "./AprovarRejeitarModal";

vi.mock("../../apolices/hooks/useApolices", () => ({
  useApolicePorId: () => ({
    data: {
      id: "ap-1",
      valorSeguro: 50000,
    },
    isLoading: false,
  }),
}));

const sinistroMock: Sinistro = {
  id: "sin-1",
  numeroSinistro: "SIN-2026-0001",
  apoliceId: "ap-1",
  seguradoId: "seg-1",
  status: "EM_ANALISE",
  tipoSinistro: "COLISAO",
  descricao: "Batida na traseira",
  dataOcorrencia: "2026-09-20T10:00:00Z",
  valorEstimado: 10000,
};

describe("AprovarRejeitarModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar modal de aprovação com valor estimado preenchido", () => {
    render(
      <AprovarRejeitarModal
        isOpen={true}
        onClose={vi.fn()}
        sinistro={sinistroMock}
        acao="aprovar"
        onConfirmAprovar={vi.fn()}
        onConfirmRejeitar={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Aprovar e Liquidar Sinistro"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Confirmar Aprovação/i }),
    ).toBeInTheDocument();
    const inputValor = screen.getByLabelText(/Valor Aprovado para Indenização/i);
    expect(inputValor).toHaveValue(10000);
  });

  it("deve chamar onConfirmAprovar com valor digitado", () => {
    const handleAprovar = vi.fn();

    render(
      <AprovarRejeitarModal
        isOpen={true}
        onClose={vi.fn()}
        sinistro={sinistroMock}
        acao="aprovar"
        onConfirmAprovar={handleAprovar}
        onConfirmRejeitar={vi.fn()}
      />,
    );

    const inputValor = screen.getByLabelText(/Valor Aprovado para Indenização/i);
    fireEvent.change(inputValor, { target: { value: "15000" } });

    fireEvent.click(
      screen.getByRole("button", { name: /Confirmar Aprovação/i }),
    );

    expect(handleAprovar).toHaveBeenCalledWith(15000);
  });

  it("deve renderizar modal de rejeição e submeter com motivo selecionado", () => {
    const handleRejeitar = vi.fn();

    render(
      <AprovarRejeitarModal
        isOpen={true}
        onClose={vi.fn()}
        sinistro={sinistroMock}
        acao="rejeitar"
        onConfirmAprovar={vi.fn()}
        onConfirmRejeitar={handleRejeitar}
      />,
    );

    expect(screen.getByText("Rejeitar Sinistro")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Confirmar Rejeição/i }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Confirmar Rejeição/i }),
    );

    expect(handleRejeitar).toHaveBeenCalledWith(
      "Cobertura não contempla o evento",
    );
  });
});
