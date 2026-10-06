import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import {
  MicroserviceTimelineCard,
  type MicroserviceTimelineSinistro,
} from "./MicroserviceTimelineCard";

// Mock do hook useHistoricoSinistro
vi.mock("../../sinistros/hooks/useSinistros", () => ({
  useHistoricoSinistro: vi.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("MicroserviceTimelineCard", () => {
  it("deve renderizar estado vazio quando não houver sinistro (sem dados mockados)", () => {
    renderWithProviders(<MicroserviceTimelineCard />);

    expect(screen.getByText("Nenhum sinistro na esteira")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Assim que sinistros forem registrados, o rastreamento em tempo real dos microsserviços aparecerá aqui.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Ir para sinistros →")).toBeInTheDocument();

    // Garante que os dados falsos antigos ("valor 4,2k", etc.) NÃO aparecem
    expect(screen.queryByText(/valor 4,2k/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Liquidando\.\.\./i)).not.toBeInTheDocument();
  });

  it("deve renderizar skeleton pulse durante isLoading", () => {
    const { container } = renderWithProviders(
      <MicroserviceTimelineCard isLoading={true} />,
    );

    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
    expect(screen.queryByText("Nenhum sinistro na esteira")).not.toBeInTheDocument();
  });

  it("deve renderizar as etapas reais para sinistro REGISTRADO", () => {
    const sinistroRegistrado: MicroserviceTimelineSinistro = {
      id: "sin-1",
      numeroSinistro: "SN-2026-0001",
      seguradoNome: "Carlos Alberto",
      numeroApolice: "AP-2026-0099",
      tipoSinistro: "COLISAO",
      status: "REGISTRADO",
      valorEstimado: 8500,
      createdAt: "2026-09-29T10:00:00Z",
    };

    renderWithProviders(
      <MicroserviceTimelineCard ultimoSinistro={sinistroRegistrado} />,
    );

    expect(screen.getByText("Esteira de microsserviços")).toBeInTheDocument();
    expect(screen.getByText("SN-2026-0001")).toBeInTheDocument();
    expect(screen.getByText(/Carlos Alberto/)).toBeInTheDocument();
    expect(screen.getByText("Registrado")).toBeInTheDocument();

    // Etapa 1: Registro concluído
    expect(screen.getByText("Registro & Validação")).toBeInTheDocument();
    expect(screen.getByText("OpenFeign")).toBeInTheDocument();

    // Etapa 2: Aguardando triagem
    expect(screen.getByText("Aguardando Triagem")).toBeInTheDocument();

    // Etapa 3: Decisão pendente
    expect(screen.getByText("Decisão do Sinistro")).toBeInTheDocument();

    // Etapa 4: Liquidação pendente
    expect(screen.getByText("Liquidação Financeira")).toBeInTheDocument();

    // Rodapé
    expect(screen.getByText(/AP-2026-0099/)).toBeInTheDocument();
  });

  it("deve renderizar corretamente para sinistro APROVADO com valor real", () => {
    const sinistroAprovado: MicroserviceTimelineSinistro = {
      id: "sin-2",
      numeroSinistro: "SN-2026-0002",
      seguradoNome: "Mariana Souza",
      status: "APROVADO",
      valorEstimado: 5000,
      valorAprovado: 4800,
      createdAt: "2026-09-28T14:00:00Z",
    };

    renderWithProviders(
      <MicroserviceTimelineCard ultimoSinistro={sinistroAprovado} />,
    );

    expect(screen.getByText("Aprovado")).toBeInTheDocument();
    expect(screen.getByText("Sinistro Aprovado")).toBeInTheDocument();
    expect(screen.getByText(/Processando Pagamento\.\.\./)).toBeInTheDocument();
    expect(screen.getByText("R$ 4.800,00")).toBeInTheDocument();
  });

  it("deve renderizar fluxo de recusa para sinistro REJEITADO (liquidação dispensada)", () => {
    const sinistroRejeitado: MicroserviceTimelineSinistro = {
      id: "sin-3",
      numeroSinistro: "SN-2026-0003",
      seguradoNome: "Roberto Dias",
      status: "REJEITADO",
      motivoRejeicao: "Evento anterior ao início de vigência",
      valorEstimado: 12000,
      createdAt: "2026-09-27T09:00:00Z",
    };

    renderWithProviders(
      <MicroserviceTimelineCard ultimoSinistro={sinistroRejeitado} />,
    );

    expect(screen.getByText("Rejeitado")).toBeInTheDocument();
    expect(screen.getByText("Sinistro Rejeitado")).toBeInTheDocument();
    expect(
      screen.getByText(/Evento anterior ao início de vigência/),
    ).toBeInTheDocument();
    expect(screen.getByText("Liquidação Dispensada")).toBeInTheDocument();
    expect(screen.getByText("Notificado da Recusa")).toBeInTheDocument();
  });

  it("deve renderizar fluxo concluído para sinistro PAGO", () => {
    const sinistroPago: MicroserviceTimelineSinistro = {
      id: "sin-4",
      numeroSinistro: "SN-2026-0004",
      seguradoNome: "Ana Paula",
      status: "PAGO",
      valorAprovado: 15000,
      createdAt: "2026-09-25T11:00:00Z",
    };

    renderWithProviders(
      <MicroserviceTimelineCard ultimoSinistro={sinistroPago} />,
    );

    expect(screen.getByText("Pago")).toBeInTheDocument();
    expect(screen.getByText("Pagamento Liquidado")).toBeInTheDocument();
    expect(screen.getByText("Segurado Notificado")).toBeInTheDocument();
    expect(screen.getByText("R$ 15.000,00")).toBeInTheDocument();
  });

  it("deve permitir alternar entre sinistros pelo seletor", () => {
    const sinistros: MicroserviceTimelineSinistro[] = [
      {
        id: "sin-1",
        numeroSinistro: "SN-2026-0001",
        seguradoNome: "Segurado 1",
        status: "REGISTRADO",
      },
      {
        id: "sin-2",
        numeroSinistro: "SN-2026-0002",
        seguradoNome: "Segurado 2",
        status: "PAGO",
        valorAprovado: 3500,
      },
    ];

    const onSelecionar = vi.fn();

    renderWithProviders(
      <MicroserviceTimelineCard
        sinistros={sinistros}
        sinistroSelecionadoId="sin-1"
        onSelecionarSinistro={onSelecionar}
      />,
    );

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: "sin-2" } });
    expect(onSelecionar).toHaveBeenCalledWith("sin-2");
  });

  it("deve acionar onVerDetalhes ao clicar no botão de detalhes", () => {
    const sinistro: MicroserviceTimelineSinistro = {
      id: "sin-1",
      numeroSinistro: "SN-2026-0001",
      seguradoNome: "Cliente Teste",
      status: "EM_ANALISE",
      valorEstimado: 3000,
    };

    const onVerDetalhes = vi.fn();

    renderWithProviders(
      <MicroserviceTimelineCard
        ultimoSinistro={sinistro}
        onVerDetalhes={onVerDetalhes}
      />,
    );

    const btn = screen.getByText("Ver detalhes →");
    fireEvent.click(btn);

    expect(onVerDetalhes).toHaveBeenCalledWith(sinistro);
  });
});

