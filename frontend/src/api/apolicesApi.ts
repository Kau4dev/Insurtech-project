import type { Apolice } from "../interfaces/apolices/apolice";
import type { ApoliceRequest } from "../interfaces/apolices/apoliceRequest";
import type { FiltrosApolices } from "../interfaces/apolices/filtrosApolices";
import type { RespostaPaginada } from "../interfaces/respostaPaginada";
import { MOCK_APOLICES } from "../mocks/mockApolices";
import { axiosClient } from "./axiosClient";

let mockStore: Apolice[] = [...MOCK_APOLICES];

export const apolicesApi = {
  cadastrar: async (dto: ApoliceRequest): Promise<Apolice> => {
    try {
      const response = await axiosClient.post<Apolice>("/apolices", dto);
      return response.data;
    } catch (err) {
      console.warn(
        "Backend offline/indisponível. Criando apólice mocada no frontend.",
        err,
      );
      const novaApolice: Apolice = {
        id: crypto.randomUUID(),
        ...dto,
        status: "ATIVA",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockStore = [novaApolice, ...mockStore];
      return novaApolice;
    }
  },

  buscarPorId: async (id: string): Promise<Apolice> => {
    try {
      const response = await axiosClient.get<Apolice>(`/apolices/${id}`);
      return response.data;
    } catch (err) {
      console.warn(
        "Backend offline/indisponível. Buscando apólice mocada no frontend.",
        err,
      );
      const apolice = mockStore.find((a) => a.id === id);
      if (!apolice) throw new Error("Apólice não encontrada", { cause: err });
      return apolice;
    }
  },

  listar: async (
    filtros?: FiltrosApolices,
  ): Promise<RespostaPaginada<Apolice>> => {
    try {
      const response = await axiosClient.get("/apolices", { params: filtros });
      return response.data;
    } catch (err) {
      console.warn(
        "Backend offline/indisponível. Carregando lista de apólices mocadas no frontend.",
        err,
      );
      let resultado = [...mockStore];

      if (filtros?.status) {
        resultado = resultado.filter((a) => a.status === filtros.status);
      }

      if (filtros?.tipoSeguro) {
        resultado = resultado.filter(
          (a) => a.tipoSeguro === filtros.tipoSeguro,
        );
      }

      if (filtros?.seguradoId) {
        const termo = filtros.seguradoId.toLowerCase();
        resultado = resultado.filter(
          (a) =>
            a.seguradoId.toLowerCase().includes(termo) ||
            a.numeroApolice.toLowerCase().includes(termo),
        );
      }

      const page = filtros?.page ?? 0;
      const size = filtros?.size ?? 10;
      const start = page * size;
      const paginatedContent = resultado.slice(start, start + size);
      const totalElements = resultado.length;
      const totalPages = Math.ceil(totalElements / size) || 1;

      return {
        content: paginatedContent,
        page,
        size,
        totalElements,
        totalPages,
      };
    }
  },

  atualizarStatus: async (
    id: string,
    status: Apolice["status"],
  ): Promise<Apolice> => {
    try {
      const response = await axiosClient.patch<Apolice>(
        `/apolices/${id}/status`,
        { status },
      );
      return response.data;
    } catch (err) {
      console.warn(
        "Backend offline/indisponível. Atualizando status de apólice mocada no frontend.",
        err,
      );
      const index = mockStore.findIndex((a) => a.id === id);
      if (index === -1)
        throw new Error("Apólice não encontrada", { cause: err });

      const apoliceAtualizada: Apolice = {
        ...mockStore[index],
        status,
        updatedAt: new Date().toISOString(),
      };
      mockStore[index] = apoliceAtualizada;
      return apoliceAtualizada;
    }
  },
};
