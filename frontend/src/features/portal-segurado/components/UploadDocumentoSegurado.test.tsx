import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UploadDocumentoSegurado } from "./UploadDocumentoSegurado";

vi.mock("../../../api/sinistrosApi", () => ({
  sinistrosApi: {
    adicionarDocumento: vi.fn(),
  },
}));

describe("UploadDocumentoSegurado", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar campos de documento e botões de preenchimento rápido", () => {
    render(
      <UploadDocumentoSegurado
        sinistroId="sin-1"
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText(/Documentação Pendente Solicitada/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de Documento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome do Arquivo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/URL do Arquivo/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar Documento/i })).toBeInTheDocument();
  });

  it("deve validar campos obrigatórios e formato de URL", async () => {
    render(
      <UploadDocumentoSegurado
        sinistroId="sin-1"
        onSuccess={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Enviar Documento/i }));
    expect(screen.getByText(/Informe o nome do arquivo a ser enviado/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Nome do Arquivo/i), {
      target: { value: "laudo.pdf" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Enviar Documento/i }));
    expect(screen.getByText(/Informe o link ou URL do documento/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/URL do Arquivo/i), {
      target: { value: "invalid-url" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Enviar Documento/i }));
    expect(
      screen.getByText(/A URL do documento deve começar com https:\/\/ ou http:\/\//i)
    ).toBeInTheDocument();
  });

  it("deve preencher campos com o botão de exemplo rápido", () => {
    render(
      <UploadDocumentoSegurado
        sinistroId="sin-1"
        onSuccess={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /B.O. \(\.pdf\)/i }));

    expect(
      (screen.getByLabelText(/Nome do Arquivo/i) as HTMLInputElement).value
    ).toBe("boletim_ocorrencia.pdf");
    expect(
      (screen.getByLabelText(/URL do Arquivo/i) as HTMLInputElement).value
    ).toContain("boletim_ocorrencia.pdf");
  });
});
