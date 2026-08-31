import type { TipoDocumento } from "../enums";

export interface DocumentoSinistro {
    id?: string;
    tipoDocumento: TipoDocumento;
    nomeArquivo: string;
    urlArquivo: string;
    dataUpload: string;
}