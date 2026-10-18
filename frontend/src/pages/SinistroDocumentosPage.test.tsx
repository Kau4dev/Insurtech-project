import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Sinistro } from "../interfaces/sinistros/sinistro";
import { SinistroDocumentosPage } from "./SinistroDocumentosPage";

const mockSinistroBase: Sinistro = {
  id: "sin-1",
  numeroSinistro: "SIN-2026-001",
  apoliceId: "apolice-1",
  seguradoId: "segurado-1",
  analistaId: "analista-123",
  tipoSinistro: "COLISAO",
  dataOcorrencia: "2026-03-01T10:00:00Z",
  descricao: "Batida traseira",
  valorEstimado: 5000,
  status: "EM_ANALISE",
};

let mockSinistroRetornado: Sinistro | null = mockSinistroBase;

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "sin-1" }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({
    usuario: {
      id: "analista-123",
      nome: "Carlos Analista",
      papel: "ANALISTA",
    },
  }),
}));

vi.mock("../features/segurados/components/SeguradoNome", () => ({
  SeguradoNome: () => <span>Segurado Teste</span>,
}));

vi.mock("../features/apolices/components/ApoliceNumero", () => ({
  ApoliceNumero: () => <span>AP-2026-0001</span>,
}));

vi.mock("../features/sinistros", () => ({
  AnalistaNome: () => <span>Analista Teste</span>,
  AdicionarDocumentoModal: () => <div data-testid="modal-adicionar-doc" />,
  useSinistros: () => ({ data: { content: [mockSinistroBase] } }),
  useSinistroPorId: () => ({
    data: mockSinistroRetornado,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useAguardarDocumentos: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe("SinistroDocumentosPage - Condição de Adicionar Documento", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("NÃO deve exibir o botão 'Anexar Documento' quando o status for EM_ANALISE", () => {
    mockSinistroRetornado = { ...mockSinistroBase, status: "EM_ANALISE" };

    render(
      <BrowserRouter>
        <SinistroDocumentosPage />
      </BrowserRouter>
    );

    expect(
      screen.queryByRole("button", { name: /anexar documento/i })
    ).not.toBeInTheDocument();
  });

  it("NÃO deve exibir o botão 'Anexar Documento' quando o status for REGISTRADO", () => {
    mockSinistroRetornado = { ...mockSinistroBase, status: "REGISTRADO" };

    render(
      <BrowserRouter>
        <SinistroDocumentosPage />
      </BrowserRouter>
    );

    expect(
      screen.queryByRole("button", { name: /anexar documento/i })
    ).not.toBeInTheDocument();
  });

  it("DEVE exibir o botão 'Anexar Documento' quando o status for AGUARDANDO_DOCUMENTOS", () => {
    mockSinistroRetornado = {
      ...mockSinistroBase,
      status: "AGUARDANDO_DOCUMENTOS",
    };

    render(
      <BrowserRouter>
        <SinistroDocumentosPage />
      </BrowserRouter>
    );

    expect(
      screen.getByRole("button", { name: /anexar documento/i })
    ).toBeInTheDocument();
  });
});
