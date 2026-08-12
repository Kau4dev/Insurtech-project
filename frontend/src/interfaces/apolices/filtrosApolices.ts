import type { StatusApolice, TipoSeguro } from "../enums";

export interface FiltrosApolices {
    status?: StatusApolice;
    tipoSeguro?: TipoSeguro;
    seguradoId?: string;
    page?: number;
    size?: number;
}