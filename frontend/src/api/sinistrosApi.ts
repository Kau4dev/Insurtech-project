import type { RespostaPaginada } from "../interfaces/respostaPaginada";
import type { DocumentoSinistro } from "../interfaces/sinistros/documentoSinistro";
import type { DocumentoSinistroRequest } from "../interfaces/sinistros/documentoSinistroRequest";
import type { FiltrosSinistros } from "../interfaces/sinistros/filtrosSinistros";
import type { HistoricoSinistro } from "../interfaces/sinistros/historicoSinistro";
import type {
  Sinistro,
  SinistroDetalhado,
} from "../interfaces/sinistros/sinistro";
import type {
  AprovarSinistro,
  RejeitarSinistro,
  SinistroRequest,
} from "../interfaces/sinistros/sinistroRequest";
import { MOCK_SINISTROS } from "../mocks/mockSinistros";
import { axiosClient } from "./axiosClient";

let mockStore: SinistroDetalhado[] = [...MOCK_SINISTROS];

export const sinistrosApi = {
  cadastrar: async (dto: SinistroRequest): Promise<Sinistro> => {
    try {
      const response = await axiosClient.post<Sinistro>("/sinistros", dto);
      return response.data;
    } catch (err) {
      console.warn(
        "Backend offline/indisponível. Criando sinistro mocado no frontend.",
        err,
      );
      const novoSinistro: SinistroDetalhado = {
        id: crypto.randomUUID(),
        ...dto,
        status: "REGISTRADO",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        documentos: [],
        historicos: [
          {
            statusAnterior: "REGISTRADO",
            statusNovo: "REGISTRADO",
            observacao: "Sinistro registrado no sistema.",
            createdAt: new Date().toISOString(),
          },
        ],
      };
      mockStore = [novoSinistro, ...mockStore];
      return novoSinistro;
    }
  },

  listar: async (
    filtros?: FiltrosSinistros,
  ): Promise<RespostaPaginada<Sinistro>> => {
    try {
      const response = await axiosClient.get("/sinistros", { params: filtros });
      return response.data;
    } catch (err) {
      console.warn(
        "Backend offline/indisponível. Carregando lista de sinistros mocados no frontend.",
        err,
      );
      let resultado = [...mockStore];

      if (filtros?.status) {
        resultado = resultado.filter((s) => s.status === filtros.status);
      }

      if (filtros?.tipoSinistro) {
        resultado = resultado.filter(
          (s) => s.tipoSinistro === filtros.tipoSinistro,
        );
      }

      if (filtros?.seguradoId) {
        const termo = filtros.seguradoId.toLowerCase();
        resultado = resultado.filter(
          (s) =>
            s.seguradoId.toLowerCase().includes(termo) ||
            s.numeroSinistro.toLowerCase().includes(termo),
        );
      }

      if (filtros?.apoliceId) {
        resultado = resultado.filter((s) => s.apoliceId === filtros.apoliceId);
      }

      if (filtros?.analistaId) {
        resultado = resultado.filter(
          (s) => s.analistaId === filtros.analistaId,
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

  buscarPorId: async (id: string): Promise<SinistroDetalhado> => {
    try {
      const response = await axiosClient.get<SinistroDetalhado>(
        `/sinistros/${id}`,
      );
      return response.data;
    } catch (err) {
      console.warn(
        "Backend offline/indisponível. Buscando sinistro mocado no frontend.",
        err,
      );
      const sinistro = mockStore.find((s) => s.id === id);
      if (!sinistro) throw new Error("Sinistro não encontrado", { cause: err });
      return sinistro;
    }
  },

  atribuirAnalista: async (
    id: string,
    analistaId: string,
  ): Promise<Sinistro> => {
    try {
      const response = await axiosClient.patch<Sinistro>(
        `/sinistros/${id}/atribuir`,
        null,
        {
          params: { analistaId },
        },
      );
      return response.data;
    } catch (err) {
      console.warn(
        "Backend offline/indisponível. Atribuindo analista mocado no frontend.",
        err,
      );
      const index = mockStore.findIndex((s) => s.id === id);
      if (index === -1)
        throw new Error("Sinistro não encontrado", { cause: err });

      const statusAnterior = mockStore[index].status;
      const statusNovo =
        statusAnterior === "REGISTRADO" ? "EM_ANALISE" : statusAnterior;

      const atualizado: SinistroDetalhado = {
        ...mockStore[index],
        analistaId,
        status: statusNovo,
        updatedAt: new Date().toISOString(),
        historicos: [
          ...mockStore[index].historicos,
          {
            statusAnterior,
            statusNovo,
            observacao: `Analista atribuído: ${analistaId}`,
            createdAt: new Date().toISOString(),
          },
        ],
      };
      mockStore[index] = atualizado;
      return atualizado;
    }
  },

  aguardarDocumentos: async (id: string): Promise<Sinistro> => {
    try {
      const response = await axiosClient.patch<Sinistro>(
        `/sinistros/${id}/aguardar-documentos`,
      );
      return response.data;
    } catch (err) {
      console.warn(
        "Backend offline/indisponível. Movendo status para aguardar documentos mocado.",
        err,
      );
      const index = mockStore.findIndex((s) => s.id === id);
      if (index === -1)
        throw new Error("Sinistro não encontrado", { cause: err });

      const statusAnterior = mockStore[index].status;
      const atualizado: SinistroDetalhado = {
        ...mockStore[index],
        status: "AGUARDANDO_DOCUMENTOS",
        updatedAt: new Date().toISOString(),
        historicos: [
          ...mockStore[index].historicos,
          {
            statusAnterior,
            statusNovo: "AGUARDANDO_DOCUMENTOS",
            observacao: "Aguardando envio de documentação complementar.",
            createdAt: new Date().toISOString(),
          },
        ],
      };
      mockStore[index] = atualizado;
      return atualizado;
    }
  },

  aprovar: async (id: string, dto: AprovarSinistro): Promise<Sinistro> => {
    try {
      const response = await axiosClient.patch<Sinistro>(
        `/sinistros/${id}/aprovar`,
        dto,
      );
      return response.data;
    } catch (err) {
      console.warn(
        "Backend offline/indisponível. Aprovando sinistro mocado no frontend.",
        err,
      );
      const index = mockStore.findIndex((s) => s.id === id);
      if (index === -1)
        throw new Error("Sinistro não encontrado", { cause: err });

      const statusAnterior = mockStore[index].status;
      const atualizado: SinistroDetalhado = {
        ...mockStore[index],
        status: "APROVADO",
        valorAprovado: dto.valorAprovado,
        updatedAt: new Date().toISOString(),
        historicos: [
          ...mockStore[index].historicos,
          {
            statusAnterior,
            statusNovo: "APROVADO",
            observacao: `Sinistro aprovado no valor de R$ ${dto.valorAprovado.toFixed(2)}`,
            createdAt: new Date().toISOString(),
          },
        ],
      };
      mockStore[index] = atualizado;
      return atualizado;
    }
  },

  rejeitar: async (id: string, dto: RejeitarSinistro): Promise<Sinistro> => {
    try {
      const response = await axiosClient.patch<Sinistro>(
        `/sinistros/${id}/rejeitar`,
        dto,
      );
      return response.data;
    } catch (err) {
      console.warn(
        "Backend offline/indisponível. Rejeitando sinistro mocado no frontend.",
        err,
      );
      const index = mockStore.findIndex((s) => s.id === id);
      if (index === -1)
        throw new Error("Sinistro não encontrado", { cause: err });

      const statusAnterior = mockStore[index].status;
      const atualizado: SinistroDetalhado = {
        ...mockStore[index],
        status: "REJEITADO",
        motivoRejeicao: dto.motivoRejeicao,
        updatedAt: new Date().toISOString(),
        historicos: [
          ...mockStore[index].historicos,
          {
            statusAnterior,
            statusNovo: "REJEITADO",
            observacao: `Sinistro rejeitado: ${dto.motivoRejeicao}`,
            createdAt: new Date().toISOString(),
          },
        ],
      };
      mockStore[index] = atualizado;
      return atualizado;
    }
  },

  adicionarDocumento: async (
    id: string,
    dto: DocumentoSinistroRequest,
  ): Promise<DocumentoSinistro> => {
    try {
      const response = await axiosClient.post<DocumentoSinistro>(
        `/sinistros/${id}/documentos`,
        dto,
      );
      return response.data;
    } catch (err) {
      console.warn(
        "Backend offline/indisponível. Adicionando documento mocado no frontend.",
        err,
      );
      const index = mockStore.findIndex((s) => s.id === id);
      if (index === -1)
        throw new Error("Sinistro não encontrado", { cause: err });

      const novoDocumento: DocumentoSinistro = {
        id: crypto.randomUUID(),
        ...dto,
        dataUpload: new Date().toISOString(),
      };

      mockStore[index] = {
        ...mockStore[index],
        documentos: [...mockStore[index].documentos, novoDocumento],
        updatedAt: new Date().toISOString(),
      };
      return novoDocumento;
    }
  },

  mostrarHistorico: async (id: string): Promise<HistoricoSinistro[]> => {
    try {
      const response = await axiosClient.get<HistoricoSinistro[]>(
        `/sinistros/${id}/historico`,
      );
      return response.data;
    } catch (err) {
      console.warn(
        "Backend offline/indisponível. Carregando histórico mocado no frontend.",
        err,
      );
      const sinistro = mockStore.find((s) => s.id === id);
      return sinistro?.historicos ?? [];
    }
  },
};
