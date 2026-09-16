import { z } from "zod";

const dataPassadaOuPresente = (
  msgObrigatoria: string,
  msgInvalida: string,
  msgFutura: string,
) =>
  z
    .string()
    .min(1, msgObrigatoria)
    .refine((val) => !isNaN(Date.parse(val)), { message: msgInvalida })
    .refine(
      (val) => {
        const dataInput = new Date(val);
        const hoje = new Date();
        hoje.setHours(23, 59, 59, 999);
        return dataInput <= hoje;
      },
      { message: msgFutura },
    );

export const sinistroSchema = z.object({
  numeroSinistro: z.string().min(1, "Número do sinistro é obrigatório"),
  apoliceId: z
    .uuid("ID da apólice é inválido")
    .min(1, "ID da apólice é obrigatório"),
  seguradoId: z
    .uuid("ID do segurado é inválido")
    .min(1, "ID do segurado é obrigatório"),
  tipoSinistro: z.enum(
    [
      "COLISAO",
      "ROUBO_FURTO",
      "INCENDIO",
      "DANO_A_TERCEIRO",
      "ALAGAMENTO",
      "QUEBRA_DE_VIDRO",
      "OUTROS",
    ],
    {
      message: "Tipo de sinistro é obrigatório",
    },
  ),
  descricao: z
    .string()
    .min(1, "Descrição do sinistro é obrigatória")
    .max(1000, "Descrição do sinistro deve ter no máximo 1000 caracteres"),
  dataOcorrencia: dataPassadaOuPresente(
    "Data de ocorrência é obrigatória",
    "Data de ocorrência inválida",
    "Data de ocorrência não pode ser futura",
  ),
  valorEstimado: z.coerce
    .number({ message: "Valor estimado é obrigatório" })
    .positive("Valor estimado deve ser positivo"),
});

export type SinistroFormData = z.input<typeof sinistroSchema>;
