import { z } from "zod";
import { CoberturaSchema } from "./coberturaSchema";

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
        const hoje = new Date();
        const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
        const dataStr = val.split("T")[0];
        return dataStr >= hojeStr;
      },
      { message: msgFutura },
    );

export const apoliceSchema = z
  .object({
    seguradoId: z
      .string()
      .min(1, "ID do segurado é obrigatório")
      .refine(
        (val) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            val,
          ),
        { message: "ID do segurado é inválido" },
      ),

    numeroApolice: z.string().min(1, "Número da apólice é obrigatório"),

    tipoSeguro: z.enum(
      ["AUTO", "RESIDENCIAL", "VIDA", "PATRIMONIAL", "EMPRESARIAL"],
      { message: "Tipo de seguro é obrigatório" },
    ),

    valorSeguro: z.coerce
      .number({ message: "Valor do seguro é obrigatório" })
      .positive("Valor do seguro deve ser positivo"),

    valorPremio: z.coerce
      .number({ message: "Valor do prêmio é obrigatório" })
      .positive("Valor do prêmio deve ser positivo"),

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
    status: z
      .enum(["ATIVA", "SUSPENSA", "CANCELADA", "EXPIRADA"])
      .optional(),
    coberturas: z.array(CoberturaSchema).optional(),
  })
  .refine(
    (data) => {
      if (!data.dataInicioVigencia || !data.dataFimVigencia) return true;
      return data.dataFimVigencia >= data.dataInicioVigencia;
    },
    {
      message:
        "Data de fim da vigência deve ser posterior ou igual à data de início",
      path: ["dataFimVigencia"],
    },
  );

export type ApoliceFormData = z.input<typeof apoliceSchema>;
export type CoberturaFormData = z.input<typeof CoberturaSchema>;

