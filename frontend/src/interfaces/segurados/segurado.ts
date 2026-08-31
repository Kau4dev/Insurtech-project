import type { TipoPessoa } from "../enums";

export interface Segurado {
    id?: string;
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
    createdAt?: string;
    updatedAt?: string;
}