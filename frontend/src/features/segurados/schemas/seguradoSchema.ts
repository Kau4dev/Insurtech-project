import { z } from "zod";
import { UFS, type Uf } from "../../../interfaces/enums";

export const seguradoSchema = z
  .object({
    tipoPessoa: z.enum(["PF", "PJ"], {
      message: "Tipo de pessoa é obrigatório",
    }),
    nomeRazaoSocial: z
      .string()
      .trim()
      .min(2, "Nome/Razão Social deve ter pelo menos 2 caracteres")
      .max(255, "Nome/Razão Social deve ter no máximo 255 caracteres"),
    cpfCnpj: z
      .string()
      .min(1, "Documento é obrigatório")
      .transform((val) => val.replace(/\D/g, "")),
    email: z
      .string()
      .trim()
      .min(1, "E-mail é obrigatório")
      .email("E-mail inválido")
      .max(255, "E-mail deve ter no máximo 255 caracteres"),
    telefone: z
      .string()
      .optional()
      .transform((val) => (val ? val.replace(/\D/g, "") : ""))
      .refine(
        (val) => !val || /^\d{10,11}$/.test(val),
        "Telefone deve conter 10 ou 11 dígitos numéricos",
      ),
    dataNascimento: z.string().optional(),
    enderecoLogradouro: z
      .string()
      .max(255, "Logradouro deve ter no máximo 255 caracteres")
      .optional(),
    enderecoCidade: z
      .string()
      .max(100, "Cidade deve ter no máximo 100 caracteres")
      .optional(),
    enderecoUf: z
      .string()
      .refine(
        (val) => !val || (UFS as readonly Uf[]).includes(val as Uf),
        "UF inválida",
      )
      .optional(),
    enderecoCep: z
      .string()
      .optional()
      .transform((val) => (val ? val.replace(/\D/g, "") : ""))
      .refine(
        (val) => !val || /^\d{8}$/.test(val),
        "CEP deve conter exatamente 8 dígitos numéricos",
      ),
  })
  .superRefine((data, ctx) => {
    if (data.tipoPessoa === "PF") {
      if (data.cpfCnpj.length !== 11) {
        ctx.addIssue({
          code: "custom",
          message: "CPF deve ter exatamente 11 dígitos numéricos",
          path: ["cpfCnpj"],
        });
      }
      if (!data.dataNascimento || data.dataNascimento.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "Data de nascimento é obrigatória para Pessoa Física",
          path: ["dataNascimento"],
        });
      }
    } else if (data.tipoPessoa === "PJ") {
      if (data.cpfCnpj.length !== 14) {
        ctx.addIssue({
          code: "custom",
          message: "CNPJ deve ter exatamente 14 dígitos numéricos",
          path: ["cpfCnpj"],
        });
      }
    }
  });

export type SeguradoFormData = z.input<typeof seguradoSchema>;
