import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RespostaPaginada } from "../interfaces/respostaPaginada";
import type { Sinistro } from "../interfaces/sinistros/sinistro";
import type { SinistroRequest } from "../interfaces/sinistros/sinistroRequest";
import { axiosClient } from "./axiosClient";
import { sinistrosApi } from "./sinistrosApi";

vi.mock("./axiosClient", () => ({
  axiosClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("sinistrosApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve cadastrar sinistro via POST /sinistros", async () => {
    const mockRequest: SinistroRequest = {
      numeroSinistro: "SIN-2026-0001",
      apoliceId: "apolice-1",
      seguradoId: "segurado-1",
      tipoSinistro: "COLISAO",
      descricao: "Batida traseira",
      dataOcorrencia: "2026-09-20T10:00:00Z",
      valorEstimado: 8500,
    };
    const mockResponse: Sinistro = {
      id: "sin-1",
      status: "REGISTRADO",
      ...mockRequest,
    };
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await sinistrosApi.cadastrar(mockRequest);

    expect(axiosClient.post).toHaveBeenCalledWith("/sinistros", mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it("deve listar sinistros com parâmetros via GET /sinistros", async () => {
    const mockFiltros = { numeroSinistro: "SIN-2026", page: 0, size: 10 };
    const mockPaginado: RespostaPaginada<Sinistro> = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      page: 0,
    };
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockPaginado });

    const result = await sinistrosApi.listar(mockFiltros);

    expect(axiosClient.get).toHaveBeenCalledWith("/sinistros", {
      params: mockFiltros,
    });
    expect(result).toEqual(mockPaginado);
  });

  it("deve atribuir analista via PATCH /sinistros/:id/atribuir", async () => {
    const mockResponse = { id: "sin-1", analistaId: "analista-1", status: "EM_ANALISE" };
    vi.mocked(axiosClient.patch).mockResolvedValueOnce({ data: mockResponse });

    const result = await sinistrosApi.atribuirAnalista("sin-1", "analista-1");

    expect(axiosClient.patch).toHaveBeenCalledWith(
      "/sinistros/sin-1/atribuir",
      null,
      { params: { analistaId: "analista-1" } },
    );
    expect(result).toEqual(mockResponse);
  });

  it("deve aprovar sinistro via PATCH /sinistros/:id/aprovar", async () => {
    const mockDto = { valorAprovado: 7500 };
    const mockResponse = { id: "sin-1", status: "APROVADO", valorAprovado: 7500 };
    vi.mocked(axiosClient.patch).mockResolvedValueOnce({ data: mockResponse });

    const result = await sinistrosApi.aprovar("sin-1", mockDto);

    expect(axiosClient.patch).toHaveBeenCalledWith(
      "/sinistros/sin-1/aprovar",
      mockDto,
    );
    expect(result).toEqual(mockResponse);
  });

  it("deve rejeitar sinistro via PATCH /sinistros/:id/rejeitar", async () => {
    const mockDto = { motivoRejeicao: "Fora da cobertura da apólice" };
    const mockResponse = { id: "sin-1", status: "REJEITADO" };
    vi.mocked(axiosClient.patch).mockResolvedValueOnce({ data: mockResponse });

    const result = await sinistrosApi.rejeitar("sin-1", mockDto);

    expect(axiosClient.patch).toHaveBeenCalledWith(
      "/sinistros/sin-1/rejeitar",
      mockDto,
    );
    expect(result).toEqual(mockResponse);
  });

  it("deve adicionar documento via POST /sinistros/:id/documentos", async () => {
    const mockDto = {
      tipoDocumento: "FOTO_DANO" as const,
      nomeArquivo: "foto.png",
      urlArquivo: "https://s3.example.com/foto.png",
    };
    const mockResponse = { id: "doc-1", dataUpload: "2026-09-24T10:00:00Z", ...mockDto };
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await sinistrosApi.adicionarDocumento("sin-1", mockDto);

    expect(axiosClient.post).toHaveBeenCalledWith(
      "/sinistros/sin-1/documentos",
      mockDto,
    );
    expect(result).toEqual(mockResponse);
  });

  it("deve obter dados consolidados do dashboard via GET /sinistros/dashboard/resumo", async () => {
    const mockDashboard = {
      totalSinistros: 15,
      totalAprovados: 8,
      totalRejeitados: 2,
      totalEmAnalise: 5,
      valorTotalAprovado: 120000,
      valorTotalEstimado: 150000,
      contagemPorStatus: {
        REGISTRADO: 2,
        EM_ANALISE: 3,
        APROVADO: 8,
        REJEITADO: 2,
      },
    };
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockDashboard });

    const result = await sinistrosApi.obterDashboard();

    expect(axiosClient.get).toHaveBeenCalledWith("/sinistros/dashboard/resumo");
    expect(result).toEqual(mockDashboard);
  });
});
