import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RespostaPaginada } from "../interfaces/respostaPaginada";
import type { Segurado } from "../interfaces/segurados/segurado";
import type {
  SeguradoRequest,
  SeguradoUpdateRequest,
} from "../interfaces/segurados/seguradoRequest";
import { axiosClient } from "./axiosClient";
import { seguradoApi } from "./seguradosApi";

vi.mock("./axiosClient", () => ({
  axiosClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("seguradoApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve cadastrar segurado enviando POST /segurados", async () => {
    const mockRequest: SeguradoRequest = {
      nomeRazaoSocial: "João Silva",
      cpfCnpj: "12345678901",
      tipoPessoa: "PF",
      email: "joao@example.com",
      telefone: "11999998888",
      enderecoLogradouro: "Rua das Flores, 100",
      enderecoCidade: "São Paulo",
      enderecoUf: "SP",
      enderecoCep: "01001000",
    };
    const mockResponse: Segurado = { id: "seg-1", ...mockRequest };
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await seguradoApi.cadastrar(mockRequest);

    expect(axiosClient.post).toHaveBeenCalledWith("/segurados", mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it("deve buscar segurado por id via GET /segurados/:id", async () => {
    const mockSegurado = { id: "seg-1", nomeRazaoSocial: "João Silva" };
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockSegurado });

    const result = await seguradoApi.buscarPorId("seg-1");

    expect(axiosClient.get).toHaveBeenCalledWith("/segurados/seg-1");
    expect(result).toEqual(mockSegurado);
  });

  it("deve listar segurados com paginação via GET /segurados", async () => {
    const mockFiltros = { nome: "Silva", page: 0, size: 10 };
    const mockPaginado: RespostaPaginada<Segurado> = {
      content: [
        {
          id: "seg-1",
          nomeRazaoSocial: "João Silva",
          cpfCnpj: "12345678901",
          tipoPessoa: "PF",
          email: "joao@example.com",
          telefone: "11999998888",
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      page: 0,
    };
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockPaginado });

    const result = await seguradoApi.listar(mockFiltros);

    expect(axiosClient.get).toHaveBeenCalledWith("/segurados", {
      params: mockFiltros,
    });
    expect(result).toEqual(mockPaginado);
  });

  it("deve atualizar segurado via PUT /segurados/:id", async () => {
    const mockUpdate: SeguradoUpdateRequest = {
      nomeRazaoSocial: "João Silva Atualizado",
      email: "joao.novo@example.com",
      telefone: "11988887777",
    };
    const mockResponse = { id: "seg-1", ...mockUpdate };
    vi.mocked(axiosClient.put).mockResolvedValueOnce({ data: mockResponse });

    const result = await seguradoApi.atualizar("seg-1", mockUpdate);

    expect(axiosClient.put).toHaveBeenCalledWith("/segurados/seg-1", mockUpdate);
    expect(result).toEqual(mockResponse);
  });
});
