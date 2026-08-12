import { axiosClient } from "./axiosClient";
import type { FiltrosSegurados } from "../interfaces/segurados/filtrosSegurados";
import type { Segurado } from "../interfaces/segurados/segurado";
import type { SeguradoRequest, SeguradoUpdateRequest } from "../interfaces/segurados/seguradoRequest";
import type { RespostaPaginada } from "../interfaces/respostaPaginada";


export const seguradoApi = {


    criar: async (dto: SeguradoRequest): Promise<Segurado> => {
        const response = await axiosClient.post<Segurado>('/segurados', dto);
        return response.data;
    },

    buscarPorId: async (id: string): Promise<Segurado> => {
        const response = await axiosClient.get<Segurado>(`/segurados/${id}`);
        return response.data;
    },

    listar: async (filtros?: FiltrosSegurados): Promise<RespostaPaginada<Segurado>>  => {
        const response = await axiosClient.get('/segurados', { params: filtros });
        return response.data;
    },
  
    atualizar: async (id: string, dto: SeguradoUpdateRequest): Promise<Segurado> => {
        const response = await axiosClient.put<Segurado>(`/segurados/${id}`, dto);
        return response.data;
    },
}