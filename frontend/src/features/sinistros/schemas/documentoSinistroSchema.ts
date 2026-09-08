import { z } from "zod";

export const documentoSinistroSchema = z.object({
  tipoDocumento: z.enum(
    [
      "BOLETIM_OCORRENCIA",
      "FOTO_DANO",
      "NOTA_FISCAL",
      "LAUDO_TECNICO",
      "CNH",
      "DOCUMENTO_VEICULO",
      "OUTROS",
    ],
    {
      message: "Tipo de documento é obrigatório",
    },
  ),
  nomeArquivo: z
    .string()
    .min(1, "Nome do arquivo é obrigatório")
    .max(255, "Nome do arquivo deve ter no máximo 255 caracteres"),
  urlArquivo: z
    .string()
    .min(1, "URL do arquivo é obrigatória")
    .max(500, "URL do arquivo deve ter no máximo 500 caracteres"),
});

export type DocumentoSinistroFormData = z.infer<typeof documentoSinistroSchema>;
