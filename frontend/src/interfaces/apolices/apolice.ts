
import type { Cobertura } from "./cobertura";

export type Apolice = {
    id?: string;
    seguradoId: string;
    numeroApolice: string;
    tipoSeguro: 'AUTO' | 'RESIDENCIAL' | 'VIDA' | 'PATRIMONIAL' | 'EMPRESARIAL';
    valorSeguro: number;
    valorPremio: number;
    dataInicioVigencia: string;
    dataFimVigencia: string;
    status: 'ATIVA' | 'CANCELADA' | 'EXPIRADA' | 'SUSPENSA';
    coberturas?: Cobertura[];
    createdAt?: string;
    updatedAt?: string;
}