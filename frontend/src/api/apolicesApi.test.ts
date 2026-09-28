import { describe, expect, it, vi, beforeEach } from "vitest";
import { apolicesApi } from "./apolicesApi";
import { axiosClient } from "./axiosClient";
import type { RespostaPaginada } from "../interfaces/respostaPaginada";
import type { Apolice } from "../interfaces/apolices/apolice";

vi.mock("./axiosClient", () => ({
  axiosClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("apolicesApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve cadastrar apólice enviando POST /apolices", async () => {
    const mockRequest = {
      numeroApolice: "AP-2026-0001",
      seguradoId: "segurado-1",
      tipoSeguro: "AUTO" as const,
      dataInicioVigencia: "2026-01-01",
      dataFimVigencia: "2027-01-01",
      valorPremio: 1500,
      valorSeguro: 50000,
      coberturas: [],
    };
    const mockResponse = { id: "apolice-1", ...mockRequest };
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await apolicesApi.cadastrar(mockRequest);

    expect(axiosClient.post).toHaveBeenCalledWith("/apolices", mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it("deve buscar apólice por ID em GET /apolices/:id", async () => {
    const mockApolice = { id: "apolice-123", numeroApolice: "AP-123" };
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockApolice });

    const result = await apolicesApi.buscarPorId("apolice-123");

    expect(axiosClient.get).toHaveBeenCalledWith("/apolices/apolice-123");
    expect(result).toEqual(mockApolice);
  });

  it("deve listar apólices com filtros em GET /apolices", async () => {
    const mockFiltros = { numeroApolice: "AP-2026", page: 0, size: 10 };
    const mockPagina: RespostaPaginada<Apolice> = {
      content: [
        {
          id: "apolice-1",
          numeroApolice: "AP-2026-0001",
          seguradoId: "segurado-1",
          tipoSeguro: "AUTO",
          dataInicioVigencia: "2026-01-01",
          dataFimVigencia: "2027-01-01",
          valorPremio: 1500,
          valorSeguro: 50000,
          status: "ATIVA",
          coberturas: [],
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      page: 0,
    };
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockPagina });

    const result = await apolicesApi.listar(mockFiltros);

    expect(axiosClient.get).toHaveBeenCalledWith("/apolices", { params: mockFiltros });
    expect(result).toEqual(mockPagina);
  });

  it("deve atualizar status da apólice em PATCH /apolices/:id/status", async () => {
    const mockRetorno = { id: "apolice-1", status: "SUSPENSA" as const };
    vi.mocked(axiosClient.patch).mockResolvedValueOnce({ data: mockRetorno });

    const result = await apolicesApi.atualizarStatus("apolice-1", "SUSPENSA");

    expect(axiosClient.patch).toHaveBeenCalledWith("/apolices/apolice-1/status", {
      status: "SUSPENSA",
    });
    expect(result).toEqual(mockRetorno);
  });
});
