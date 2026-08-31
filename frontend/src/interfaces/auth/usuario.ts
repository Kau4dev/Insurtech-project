import type { PapelUsuario } from "../enums";

export interface Usuario {
    id: string;
    nome: string;
    email: string;
    papel: PapelUsuario;
}