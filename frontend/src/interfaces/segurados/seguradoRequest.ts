import type { TipoPessoa } from "../enums";

export interface SeguradoRequest {
    tipoPessoa: TipoPessoa;
    nomeRazaoSocial: string;
    cpfCnpj: string;
    email: string;
    telefone?: string;
    dataNascimento?: string;
    enderecoLogradouro?: string;
    enderecoCidade?: string;
    enderecoUf?: string;
    enderecoCep?: string;
}

export type SeguradoUpdateRequest = Partial<Omit<SeguradoRequest, 'tipoPessoa' | 'cpfCnpj'>>;