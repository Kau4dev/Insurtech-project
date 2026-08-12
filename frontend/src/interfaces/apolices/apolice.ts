import type { StatusApolice, TipoSeguro } from "../enums";
import type { Cobertura } from "./cobertura";

export interface Apolice {
    id?: string;
    seguradoId: string;
    numeroApolice: string;
    tipoSeguro: TipoSeguro;
    valorSeguro: number;
    valorPremio: number;
    dataInicioVigencia: string;
    dataFimVigencia: string;
    status: StatusApolice;
    coberturas?: Cobertura[];
    createdAt?: string;
    updatedAt?: string;
}