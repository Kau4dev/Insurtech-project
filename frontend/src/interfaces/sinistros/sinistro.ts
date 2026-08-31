import type { StatusSinistro, TipoSinistro } from "../enums";
import type { HistoricoSinistro } from "./historicoSinistro";
import type { DocumentoSinistro } from "./documentoSinistro";

export interface Sinistro {
    id?: string;
    numeroSinistro: string;
    apoliceId: string;
    seguradoId: string;
    analistaId?: string;
    tipoSinistro: TipoSinistro;
    descricao: string;
    dataOcorrencia: string;
    valorEstimado: number;
    valorAprovado?: number;
    status: StatusSinistro;
    motivoRejeicao?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface SinistroDetalhado extends Sinistro {
    historicos: HistoricoSinistro[];
    documentos: DocumentoSinistro[];
}