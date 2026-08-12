import { axiosClient } from "./axiosClient";
import type { Sinistro, SinistroDetalhado } from "../interfaces/sinistros/sinistro";
import type { SinistroRequest, AprovarSinistro, RejeitarSinistro } from "../interfaces/sinistros/sinistroRequest";
import type { DocumentoSinistroRequest } from "../interfaces/sinistros/documentoSinistroRequest";
import type { DocumentoSinistro } from "../interfaces/sinistros/documentoSinistro";
import type { HistoricoSinistro } from "../interfaces/sinistros/historicoSinistro";
import type { FiltrosSinistros } from "../interfaces/sinistros/filtrosSinistros";
import type { RespostaPaginada } from "../interfaces/respostaPaginada";

export const sinistrosApi = {

    registrar: async (dto: SinistroRequest): Promise<Sinistro> => {
        const response = await axiosClient.post<Sinistro>('/sinistros', dto);
        return response.data;
    },

    listar: async (filtros?: FiltrosSinistros): Promise<RespostaPaginada<Sinistro>> => {
        const response = await axiosClient.get('/sinistros', { params: filtros });
        return response.data;
    },

    buscarPorId: async (id: string): Promise<SinistroDetalhado> => {
        const response = await axiosClient.get<SinistroDetalhado>(`/sinistros/${id}`);
        return response.data;
    },

    atribuirAnalista: async (id: string, analistaId: string): Promise<Sinistro> => {
        const response = await axiosClient.patch<Sinistro>(`/sinistros/${id}/atribuir`, null, { params: { analistaId } });
        return response.data;
    },

    aguardarDocumentos: async (id: string): Promise<Sinistro> => {
        const response = await axiosClient.patch<Sinistro>(`/sinistros/${id}/aguardar-documentos`);
        return response.data;
    },

    aprovar: async (id: string, dto: AprovarSinistro): Promise<Sinistro> => {
        const response = await axiosClient.patch<Sinistro>(`/sinistros/${id}/aprovar`, dto);
        return response.data;
    },

    rejeitar: async (id: string, dto: RejeitarSinistro): Promise<Sinistro> => {
        const response = await axiosClient.patch<Sinistro>(`/sinistros/${id}/rejeitar`, dto);
        return response.data;
    },

    adicionarDocumento: async (id: string, dto: DocumentoSinistroRequest): Promise<DocumentoSinistro> => {
        const response = await axiosClient.post<DocumentoSinistro>(`/sinistros/${id}/documentos`, dto);
        return response.data;
    },

    mostrarHistorico: async (id: string): Promise<HistoricoSinistro[]> => {
        const response = await axiosClient.get<HistoricoSinistro[]>(`/sinistros/${id}/historico`);
        return response.data;
    }
}