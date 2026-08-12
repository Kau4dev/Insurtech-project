import type { TipoSinistro } from "../enums";

export interface SinistroRequest {
    numeroSinistro: string;
    apoliceId: string;
    seguradoId: string;
    tipoSinistro: TipoSinistro;
    descricao: string;
    dataOcorrencia: string;
    valorEstimado: number;
}

export interface AprovarSinistro { valorAprovado: number; }
export interface RejeitarSinistro { motivoRejeicao: string; }