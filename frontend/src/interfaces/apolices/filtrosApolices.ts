import type { StatusApolice, TipoSeguro } from "../enums";

export interface FiltrosApolices {
    numeroApolice?: string;
    status?: StatusApolice;
    tipoSeguro?: TipoSeguro;
    seguradoId?: string;
    page?: number;
    size?: number;
}