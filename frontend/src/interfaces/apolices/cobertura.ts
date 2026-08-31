import type { TipoCobertura } from "../enums";

export interface Cobertura {
    id?: string;
    tipoCobertura: TipoCobertura;
    valorCobertura: number;
    valorFranquia: number;
}