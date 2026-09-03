import type { TipoSeguro } from "../enums";
import type { Cobertura } from "./cobertura";

export interface ApoliceRequest {
    seguradoId: string;
    numeroApolice: string;
    tipoSeguro: TipoSeguro;
    valorSeguro: number;
    valorPremio: number;
    dataInicioVigencia: string;
    dataFimVigencia: string;
    coberturas: Omit<Cobertura, 'id'>[];
}

export type ApoliceUpdateRequest = Partial<Omit<ApoliceRequest, 'seguradoId' | 'numeroApolice'>>;