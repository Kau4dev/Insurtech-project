import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { SeguradoSelectFilter } from "./SeguradoSelectFilter";

// Mock das APIs
vi.mock("../../../api/seguradosApi", () => ({
  seguradoApi: {
    listar: vi.fn().mockResolvedValue({
      content: [
        {
          id: "seg-1",
          tipoPessoa: "PF",
          nomeRazaoSocial: "Carlos Eduardo Silva",
          cpfCnpj: "12345678901",
          email: "carlos@email.com",
        },
        {
          id: "seg-2",
          tipoPessoa: "PJ",
          nomeRazaoSocial: "Mega Logística LTDA",
          cpfCnpj: "12345678000199",
          email: "contato@megalog.com",
        },
      ],
      totalElements: 2,
      totalPages: 1,
      size: 50,
      number: 0,
    }),
    buscarPorId: vi.fn().mockImplementation((id: string) => {
      if (id === "seg-1") {
        return Promise.resolve({
          id: "seg-1",
          tipoPessoa: "PF",
          nomeRazaoSocial: "Carlos Eduardo Silva",
          cpfCnpj: "12345678901",
          email: "carlos@email.com",
        });
      }
      return Promise.reject(new Error("Não encontrado"));
    }),
  },
}));

function renderComQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("SeguradoSelectFilter", () => {
  it("deve renderizar o input de busca quando nenhum segurado estiver selecionado", () => {
    renderComQueryClient(
      <SeguradoSelectFilter onChange={vi.fn()} label="Segurado" />,
    );

    expect(
      screen.getByPlaceholderText("Digite nome, CPF ou CNPJ para buscar..."),
    ).toBeInTheDocument();
  });

  it("deve exibir opções ao focar no input e permitir seleção", async () => {
    const handleChange = vi.fn();
    renderComQueryClient(
      <SeguradoSelectFilter onChange={handleChange} label="Segurado" />,
    );

    const input = screen.getByPlaceholderText(
      "Digite nome, CPF ou CNPJ para buscar...",
    );
    fireEvent.focus(input);

    expect(await screen.findByText("Carlos Eduardo Silva")).toBeInTheDocument();
    expect(screen.getByText("Mega Logística LTDA")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Carlos Eduardo Silva"));
    expect(handleChange).toHaveBeenCalledWith("seg-1");
  });

  it("deve filtrar por CPF ou CNPJ digitado", async () => {
    renderComQueryClient(
      <SeguradoSelectFilter onChange={vi.fn()} label="Segurado" />,
    );

    const input = screen.getByPlaceholderText(
      "Digite nome, CPF ou CNPJ para buscar...",
    );
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "000199" } });

    expect(await screen.findByText("Mega Logística LTDA")).toBeInTheDocument();
    expect(screen.queryByText("Carlos Eduardo Silva")).not.toBeInTheDocument();
  });
});

