import type { TipoDocumento } from "../enums";

export interface DocumentoSinistroRequest {
    tipoDocumento: TipoDocumento;
    nomeArquivo: string;
    urlArquivo: string;
}