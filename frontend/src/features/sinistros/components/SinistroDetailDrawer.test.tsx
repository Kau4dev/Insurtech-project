import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";
import { SinistroDetailDrawer } from "./SinistroDetailDrawer";

vi.mock("../../../context/useAuth", () => ({
  useAuth: () => ({
    usuario: {
      id: "analista-123",
      nome: "Carlos Analista",
      papel: "ANALISTA",
    },
  }),
}));

vi.mock("../../segurados/components/SeguradoNome", () => ({
  SeguradoNome: () => <span>Segurado Teste</span>,
}));

vi.mock("../../apolices/components/ApoliceNumero", () => ({
  ApoliceNumero: () => <span>AP-2026-0001</span>,
}));

vi.mock("./AnalistaNome", () => ({
  AnalistaNome: () => <span>Analista Teste</span>,
}));

vi.mock("../hooks/useSinistros", () => ({
  useSinistroPorId: () => ({ data: null }),
  useHistoricoSinistro: () => ({ data: [] }),
  useAtribuirAnalista: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useAguardarDocumentos: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("./AdicionarDocumentoModal", () => ({
  AdicionarDocumentoModal: () => <div data-testid="modal-adicionar-doc" />,
}));

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

describe("SinistroDetailDrawer - Condição de Anexar Documento", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("NÃO deve exibir o botão 'Anexar Documento' quando o status for EM_ANALISE", () => {
    render(
      <SinistroDetailDrawer
        sinistro={{ ...mockSinistroBase, status: "EM_ANALISE" }}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(
      screen.queryByRole("button", { name: /anexar documento/i })
    ).not.toBeInTheDocument();
  });

  it("NÃO deve exibir o botão 'Anexar Documento' quando o status for REGISTRADO", () => {
    render(
      <SinistroDetailDrawer
        sinistro={{ ...mockSinistroBase, status: "REGISTRADO" }}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(
      screen.queryByRole("button", { name: /anexar documento/i })
    ).not.toBeInTheDocument();
  });

  it("DEVE exibir o botão 'Anexar Documento' quando o status for AGUARDANDO_DOCUMENTOS e tiver analista atribuído", () => {
    render(
      <SinistroDetailDrawer
        sinistro={{ ...mockSinistroBase, status: "AGUARDANDO_DOCUMENTOS" }}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const botoes = screen.getAllByRole("button", { name: /anexar documento/i });
    expect(botoes.length).toBeGreaterThanOrEqual(1);
  });

  it("NÃO deve exibir o botão 'Anexar Documento' se status for AGUARDANDO_DOCUMENTOS mas analistaId for nulo", () => {
    render(
      <SinistroDetailDrawer
        sinistro={{
          ...mockSinistroBase,
          status: "AGUARDANDO_DOCUMENTOS",
          analistaId: undefined,
        }}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(
      screen.queryByRole("button", { name: /anexar documento/i })
    ).not.toBeInTheDocument();
  });
});
