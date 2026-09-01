import { z } from "zod";
import { coberturaSchema } from "./coberturaSchema";

const dataFuturaOuPresente = (
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
        hoje.setHours(0, 0, 0, 0); 
        return dataInput >= hoje;
      },
      { message: msgFutura },
    );

export const apoliceSchema = z.object({
  seguradoId: z.uuid("ID do segurado é inválido")
    .min(1, "ID do segurado é obrigatório"),

  numeroApolice: z.string().min(1, "Número da apólice é obrigatório"),

  tipoSeguro: z.enum(
    ["AUTO", "RESIDENCIAL", "VIDA", "PATRIMONIAL", "EMPRESARIAL"],
    { message: "Tipo de seguro é obrigatório" },
  ),

  valorSeguro: z
    .string()
    .min(1, "Valor do seguro é obrigatório")
    .regex(/^\d{1,14}(\.\d{1,2})?$/, "Valor inválido")
    .refine((val) => parseFloat(val) > 0, {
      message: "Valor do seguro deve ser positivo",
    }),

  valorPremio: z
    .string()
    .min(1, "Valor do prêmio é obrigatório")
    .regex(/^\d{1,14}(\.\d{1,2})?$/, "Valor inválido")
    .refine((val) => parseFloat(val) > 0, {
      message: "Valor do prêmio deve ser positivo",
    }),

  dataInicioVigencia: dataFuturaOuPresente(
    "Data de início da vigência é obrigatória",
    "Data de início da vigência inválida",
    "Data de início da vigência deve ser futura ou presente",
  ),

  dataFimVigencia: dataFuturaOuPresente(
    "Data de fim da vigência é obrigatória",
    "Data de fim da vigência inválida",
    "Data de fim da vigência deve ser futura ou presente",
  ),

  coberturas: z.array(coberturaSchema).optional(),
});




export type ApoliceFormData = z.input<typeof apoliceSchema>;
export type CoberturaFormData = z.input<typeof coberturaSchema>;
