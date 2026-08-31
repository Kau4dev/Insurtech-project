import type { StatusSinistro } from "../enums";

export interface HistoricoSinistro {
    statusAnterior: StatusSinistro;
    statusNovo: StatusSinistro;
    observacao?: string;
    createdAt?: string;
}