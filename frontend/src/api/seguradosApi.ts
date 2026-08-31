import { axiosClient } from "./axiosClient";
import type { FiltrosSegurados } from "../interfaces/segurados/filtrosSegurados";
import type { Segurado } from "../interfaces/segurados/segurado";
import type { SeguradoRequest, SeguradoUpdateRequest } from "../interfaces/segurados/seguradoRequest";
import type { RespostaPaginada } from "../interfaces/respostaPaginada";
import { MOCK_SEGURADOS } from "../mocks/mockSegurados";

let mockStore: Segurado[] = [...MOCK_SEGURADOS];

export const seguradoApi = {
  cadastrar: async (dto: SeguradoRequest): Promise<Segurado> => {
    try {
      const response = await axiosClient.post<Segurado>("/segurados", dto);
      return response.data;
    } catch (err) {
      console.warn("Backend offline/indisponível. Criando segurado mocado no frontend.", err);
      const novoSegurado: Segurado = {
        id: crypto.randomUUID(),
        ...dto,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockStore = [novoSegurado, ...mockStore];
      return novoSegurado;
    }
  },

  buscarPorId: async (id: string): Promise<Segurado> => {
    try {
      const response = await axiosClient.get<Segurado>(`/segurados/${id}`);
      return response.data;
    } catch (err) {
      console.warn("Backend offline/indisponível. Buscando segurado mocado no frontend.", err);
      const segurado = mockStore.find((s) => s.id === id);
      if (!segurado) throw new Error("Segurado não encontrado", { cause: err });
      return segurado;
    }
  },

  listar: async (filtros?: FiltrosSegurados): Promise<RespostaPaginada<Segurado>> => {
    try {
      const response = await axiosClient.get("/segurados", { params: filtros });
      return response.data;
    } catch (err) {
      console.warn("Backend offline/indisponível. Carregando lista de segurados mocados no frontend.", err);
      let resultado = [...mockStore];

      if (filtros?.nome) {
        const termo = filtros.nome.toLowerCase();
        resultado = resultado.filter(
          (s) =>
            s.nomeRazaoSocial.toLowerCase().includes(termo) ||
            s.cpfCnpj.includes(termo) ||
            s.email.toLowerCase().includes(termo)
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

  atualizar: async (id: string, dto: SeguradoUpdateRequest): Promise<Segurado> => {
    try {
      const response = await axiosClient.put<Segurado>(`/segurados/${id}`, dto);
      return response.data;
    } catch (err) {
      console.warn("Backend offline/indisponível. Atualizando segurado mocado no frontend.", err);
      const index = mockStore.findIndex((s) => s.id === id);
      if (index === -1) throw new Error("Segurado não encontrado", { cause: err });

      const seguradoAtualizado: Segurado = {
        ...mockStore[index],
        ...dto,
        updatedAt: new Date().toISOString(),
      };
      mockStore[index] = seguradoAtualizado;
      return seguradoAtualizado;
    }
  },
};