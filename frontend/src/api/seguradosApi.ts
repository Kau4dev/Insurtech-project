import { axiosClient } from "./axiosClient";
import type { FiltrosSegurado } from "../interfaces/segurados/filtrosSegurados";
import type { Segurado } from "../interfaces/segurados/segurado";
import type { SeguradoRequest, SeguradoUpdateRequest } from "../interfaces/segurados/seguradoRequest";
import type { RespostaPaginada } from "../interfaces/respostaPaginada";


export const seguradoApi = {


    criar: async (segurado: SeguradoRequest): Promise<Segurado> => {
        const response = await axiosClient.post<Segurado>('/segurados', segurado);
        return response.data;
    },

    buscarPorId: async (id: string): Promise<Segurado> => {
        const response = await axiosClient.get<Segurado>(`/segurados/${id}`);
        return response.data;
    },

    listar: async (filtros?: FiltrosSegurado): Promise<RespostaPaginada<Segurado>>  => {

        const response = await axiosClient.get('/segurados', { params: filtros });
        return response.data;
    },
  
    atualizar: async (id: string, segurado: SeguradoUpdateRequest): Promise<Segurado> => {
        const response = await axiosClient.put<Segurado>(`/segurados/${id}`, segurado);
        return response.data;
    },
}