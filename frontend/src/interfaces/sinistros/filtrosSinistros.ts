import type { StatusSinistro, TipoSinistro } from "../enums";

export interface FiltrosSinistros {
    apoliceId?: string;
    seguradoId?: string;
    analistaId?: string;
    status?: StatusSinistro;
    tipoSinistro?: TipoSinistro;
    dataInicio?: string;
    dataFim?: string;
}