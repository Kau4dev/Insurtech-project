import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { ApoliceSelectFilter } from "./ApoliceSelectFilter";

// Mock das APIs
vi.mock("../../../api/apolicesApi", () => ({
  apolicesApi: {
    listar: vi.fn().mockResolvedValue({
      content: [
        {
          id: "apolice-1",
          numeroApolice: "AP-2026-0001",
          seguradoId: "seg-1",
          tipoSeguro: "AUTOMOVEL",
          status: "ATIVA",
          valorSeguro: 50000,
          dataInicioVigencia: "2026-01-01",
          dataFimVigencia: "2027-01-01",
        },
        {
          id: "apolice-2",
          numeroApolice: "AP-2026-0002",
          seguradoId: "seg-2",
          tipoSeguro: "RESIDENCIAL",
          status: "CANCELADA",
          valorSeguro: 350000,
          dataInicioVigencia: "2026-01-01",
          dataFimVigencia: "2027-01-01",
        },
      ],
      totalElements: 2,
      totalPages: 1,
      size: 10,
      number: 0,
    }),
    buscarPorId: vi.fn().mockImplementation((id: string) => {
      if (id === "apolice-1") {
        return Promise.resolve({
          id: "apolice-1",
          numeroApolice: "AP-2026-0001",
          seguradoId: "seg-1",
          tipoSeguro: "AUTOMOVEL",
          status: "ATIVA",
          valorSeguro: 50000,
          dataInicioVigencia: "2026-01-01",
          dataFimVigencia: "2027-01-01",
        });
      }
      if (id === "apolice-2") {
        return Promise.resolve({
          id: "apolice-2",
          numeroApolice: "AP-2026-0002",
          seguradoId: "seg-2",
          tipoSeguro: "RESIDENCIAL",
          status: "CANCELADA",
          valorSeguro: 350000,
          dataInicioVigencia: "2026-01-01",
          dataFimVigencia: "2027-01-01",
        });
      }
      return Promise.reject(new Error("Não encontrado"));
    }),
  },
}));

vi.mock("../../segurados/components/SeguradoNome", () => ({
  SeguradoNome: ({ seguradoId }: { seguradoId: string }) => (
    <span data-testid="segurado-nome">Segurado {seguradoId}</span>
  ),
}));

function renderComQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("ApoliceSelectFilter", () => {
  it("deve renderizar o input de busca quando nenhuma apólice estiver selecionada ou quando value for string vazia", () => {
    const { rerender } = renderComQueryClient(
      <ApoliceSelectFilter onChange={vi.fn()} label="Apólice Vinculada" />,
    );

    expect(
      screen.getByPlaceholderText(
        "Digite o número da apólice, tipo ou status para buscar...",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Regra de Negócio:")).not.toBeInTheDocument();

    rerender(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <ApoliceSelectFilter value="" onChange={vi.fn()} label="Apólice Vinculada" />
      </QueryClientProvider>
    );

    expect(
      screen.getByPlaceholderText(
        "Digite o número da apólice, tipo ou status para buscar...",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Regra de Negócio:")).not.toBeInTheDocument();
  });

  it("deve exibir opções ao focar no input e permitir seleção", async () => {
    const handleChange = vi.fn();
    renderComQueryClient(
      <ApoliceSelectFilter onChange={handleChange} label="Apólice Vinculada" />,
    );

    const input = screen.getByPlaceholderText(
      "Digite o número da apólice, tipo ou status para buscar...",
    );
    fireEvent.focus(input);

    expect(await screen.findByText("AP-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("AP-2026-0002")).toBeInTheDocument();

    fireEvent.click(screen.getByText("AP-2026-0001"));
    expect(handleChange).toHaveBeenCalledWith(
      "apolice-1",
      expect.objectContaining({
        id: "apolice-1",
        numeroApolice: "AP-2026-0001",
      }),
    );
  });

  it("deve filtrar por número ou tipo de seguro digitado", async () => {
    renderComQueryClient(
      <ApoliceSelectFilter onChange={vi.fn()} label="Apólice Vinculada" />,
    );

    const input = screen.getByPlaceholderText(
      "Digite o número da apólice, tipo ou status para buscar...",
    );
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "RESIDENCIAL" } });

    expect(await screen.findByText("AP-2026-0002")).toBeInTheDocument();
    expect(screen.queryByText("AP-2026-0001")).not.toBeInTheDocument();
  });

  it("deve renderizar o card da apólice selecionada e alertar se não estiver ATIVA", async () => {
    renderComQueryClient(
      <ApoliceSelectFilter
        value="apolice-2"
        onChange={vi.fn()}
        label="Apólice Vinculada"
      />,
    );

    expect(await screen.findByText("AP-2026-0002")).toBeInTheDocument();
    expect(screen.getByText("Regra de Negócio:")).toBeInTheDocument();
    expect(screen.getByText(/exige uma apólice/i)).toBeInTheDocument();
  });

  it("deve reabrir o input de busca ao clicar no card da apólice selecionada", async () => {
    renderComQueryClient(
      <ApoliceSelectFilter
        value="apolice-1"
        onChange={vi.fn()}
        label="Apólice Vinculada"
      />,
    );

    expect(await screen.findByText("AP-2026-0001")).toBeInTheDocument();

    // Clica no card para reabrir
    fireEvent.click(screen.getByText("AP-2026-0001"));

    expect(
      screen.getByPlaceholderText(
        "Digite o número da apólice, tipo ou status para buscar...",
      ),
    ).toBeInTheDocument();
  });
});

