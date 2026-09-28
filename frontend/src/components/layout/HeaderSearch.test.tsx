import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apolicesApi } from "../../api/apolicesApi";
import { seguradoApi } from "../../api/seguradosApi";
import { sinistrosApi } from "../../api/sinistrosApi";
import { HeaderSearch } from "./HeaderSearch";

vi.mock("../../api/sinistrosApi", () => ({
  sinistrosApi: {
    listar: vi.fn(),
  },
}));

vi.mock("../../api/apolicesApi", () => ({
  apolicesApi: {
    listar: vi.fn(),
  },
}));

vi.mock("../../api/seguradosApi", () => ({
  seguradoApi: {
    listar: vi.fn(),
  },
}));

describe("HeaderSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o input de busca com o placeholder correto", () => {
    render(
      <MemoryRouter>
        <HeaderSearch />
      </MemoryRouter>,
    );

    expect(
      screen.getByPlaceholderText(/Buscar nº do sinistro, apólice ou CNPJ…/i),
    ).toBeInTheDocument();
  });

  it("deve acionar as APIs de busca ao digitar um termo", async () => {
    vi.mocked(sinistrosApi.listar).mockResolvedValueOnce({
      content: [
        {
          id: "s1",
          numeroSinistro: "SIN-2026-0001",
          apoliceId: "ap1",
          seguradoId: "seg1",
          status: "REGISTRADO",
          tipoSinistro: "COLISAO",
          descricao: "Batida traseira",
          dataOcorrencia: "2026-09-20T10:00:00Z",
          valorEstimado: 5000,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 5,
      page: 0,
    });
    vi.mocked(apolicesApi.listar).mockResolvedValueOnce({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 5,
      page: 0,
    });
    vi.mocked(seguradoApi.listar).mockResolvedValueOnce({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 5,
      page: 0,
    });

    render(
      <MemoryRouter>
        <HeaderSearch />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText(
      /Buscar nº do sinistro, apólice ou CNPJ…/i,
    );
    fireEvent.change(input, { target: { value: "SIN-2026" } });

    await waitFor(
      () => {
        expect(sinistrosApi.listar).toHaveBeenCalledWith({
          numeroSinistro: "SIN-2026",
          size: 5,
        });
        expect(apolicesApi.listar).toHaveBeenCalledWith({
          numeroApolice: "SIN-2026",
          size: 5,
        });
        expect(seguradoApi.listar).toHaveBeenCalledWith({
          nome: "SIN-2026",
          size: 5,
        });
      },
      { timeout: 1000 },
    );

    expect(await screen.findByText("SIN-2026-0001")).toBeInTheDocument();
  });

  it("deve limpar o input ao clicar no botão de limpar", async () => {
    render(
      <MemoryRouter>
        <HeaderSearch />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText(
      /Buscar nº do sinistro, apólice ou CNPJ…/i,
    );
    fireEvent.change(input, { target: { value: "teste" } });

    const btnLimpar = await screen.findByTitle("Limpar pesquisa");
    fireEvent.click(btnLimpar);

    expect(input).toHaveValue("");
  });
});
