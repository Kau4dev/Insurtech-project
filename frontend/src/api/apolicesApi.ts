import {axiosClient} from "./axiosClient";
import type {Apolice} from "../interfaces/apolices/apolice";
import type {ApoliceRequest} from "../interfaces/apolices/apoliceRequest";
import type {FiltrosApolices} from "../interfaces/apolices/filtrosApolices";
import type {RespostaPaginada} from "../interfaces/respostaPaginada";

export const apolicesApi = {

    criar: async (dto: ApoliceRequest): Promise<Apolice> => {

        const response = await axiosClient.post<Apolice>('/apolices', dto);
        return response.data;
    },

    buscarPorId: async (id: string): Promise<Apolice> => {

        const response = await axiosClient.get<Apolice>(`/apolices/${id}`);
        return response.data;
    },

    listar: async (filtros?: FiltrosApolices): Promise<RespostaPaginada<Apolice>>  => {

        const response = await axiosClient.get('/apolices', { params: filtros });
        return response.data;
    },

    atualizarStatus: async (id: string, status: Apolice['status']): Promise<Apolice> => {

        const response = await axiosClient.patch<Apolice>(`/apolices/${id}/status`, { status });
        return response.data;
    }
}