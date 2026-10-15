import type { PapelUsuario } from "../enums";

export interface Usuario {
    id: string;
    nome: string;
    email: string;
    papel: PapelUsuario;
    ativo?: boolean;
    createdAt?: string;
}

export interface CadastrarUsuarioRequest {
    nome: string;
    email: string;
    senha?: string;
    papel: PapelUsuario;
}

export interface UsuarioCriadoResponse {
    id: string;
    nome: string;
    email: string;
    papel: PapelUsuario;
    ativo: boolean;
    senhaTemporaria?: string;
    createdAt: string;
}