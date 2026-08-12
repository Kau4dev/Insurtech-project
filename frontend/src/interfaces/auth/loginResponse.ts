import type { PapelUsuario } from "../enums";

export interface LoginResponse {
    token: string;
    tipo: string;
    expiresIn: number;
    papel: PapelUsuario;
}