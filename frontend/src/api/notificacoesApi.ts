import { axiosClient } from "./axiosClient";

export interface NotificacaoResponse {
  id: string;
  seguradoId?: string;
  sinistroId?: string;
  titulo: string;
  mensagem: string;
  tipo: "SINISTRO_REGISTRADO" | "SINISTRO_REJEITADO" | "PAGAMENTO_LIQUIDADO" | "DOCUMENTO_SOLICITADO" | "DOCUMENTO_RECEBIDO";
  lida: boolean;
  criadoEm: string;
}

export const notificacoesApi = {
  listar: async (seguradoId?: string, apenasNaoLidas?: boolean): Promise<NotificacaoResponse[]> => {
    const params: Record<string, string | boolean> = {};
    if (seguradoId) params.seguradoId = seguradoId;
    if (apenasNaoLidas !== undefined) params.apenasNaoLidas = apenasNaoLidas;

    const response = await axiosClient.get<NotificacaoResponse[]>("/notificacoes", {
      params,
    });
    return response.data;
  },

  marcarComoLida: async (id: string): Promise<void> => {
    await axiosClient.patch(`/notificacoes/${id}/lida`);
  },

  marcarTodasComoLidas: async (seguradoId?: string): Promise<void> => {
    const params = seguradoId ? { seguradoId } : undefined;
    await axiosClient.patch("/notificacoes/marcar-todas-lidas", null, { params });
  },
};

