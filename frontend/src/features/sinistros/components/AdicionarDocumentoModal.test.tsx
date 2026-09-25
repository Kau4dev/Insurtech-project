import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdicionarDocumentoModal } from "./AdicionarDocumentoModal";

const mockMutateAsync = vi.fn();

vi.mock("../hooks/useSinistros", () => ({
  useAdicionarDocumento: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

describe("AdicionarDocumentoModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("não deve renderizar conteúdo quando isOpen for false", () => {
    render(
      <AdicionarDocumentoModal
        isOpen={false}
        onClose={vi.fn()}
        sinistroId="sin-1"
      />,
    );

    expect(
      screen.queryByText("Anexar Documento ao Sinistro"),
    ).not.toBeInTheDocument();
  });

  it("deve renderizar campos de formulário quando isOpen for true", () => {
    render(
      <AdicionarDocumentoModal
        isOpen={true}
        onClose={vi.fn()}
        sinistroId="sin-1"
        numeroSinistro="SIN-2026-001"
      />,
    );

    expect(screen.getByText("Anexar Documento ao Sinistro")).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de Documento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome do Arquivo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/URL do Arquivo/i)).toBeInTheDocument();
  });

  it("deve validar formato de URL antes de submeter", async () => {
    render(
      <AdicionarDocumentoModal
        isOpen={true}
        onClose={vi.fn()}
        sinistroId="sin-1"
      />,
    );

    fireEvent.change(screen.getByLabelText(/Nome do Arquivo/i), {
      target: { value: "documento.pdf" },
    });
    fireEvent.change(screen.getByLabelText(/URL do Arquivo/i), {
      target: { value: "ftp://servidor/arquivo.pdf" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Salvar Documento/i }));

    expect(
      await screen.findByText(
        /A URL do arquivo deve começar com http:\/\/ ou https:\/\//i,
      ),
    ).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("deve chamar mutateAsync com dados corretos ao submeter formulário válido", async () => {
    mockMutateAsync.mockResolvedValueOnce({
      id: "doc-1",
      nomeArquivo: "laudo.pdf",
      urlArquivo: "https://storage.insurtech.com/laudo.pdf",
    });

    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <AdicionarDocumentoModal
        isOpen={true}
        onClose={handleClose}
        sinistroId="sin-1"
        onSuccess={handleSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Nome do Arquivo/i), {
      target: { value: "laudo.pdf" },
    });
    fireEvent.change(screen.getByLabelText(/URL do Arquivo/i), {
      target: { value: "https://storage.insurtech.com/laudo.pdf" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Salvar Documento/i }));

    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: "sin-1",
      dto: {
        tipoDocumento: "BOLETIM_OCORRENCIA",
        nomeArquivo: "laudo.pdf",
        urlArquivo: "https://storage.insurtech.com/laudo.pdf",
      },
    });
  });
});
