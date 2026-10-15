import { describe, expect, it } from "vitest";
import { apoliceSchema } from "./apoliceSchema";

describe("apoliceSchema", () => {
  it("deve validar com sucesso os dados válidos de cadastro de apólice (sem status obrigatório)", () => {
    const hoje = new Date();
    const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
    const proximoAno = new Date(hoje.getFullYear() + 1, hoje.getMonth(), hoje.getDate());
    const proximoAnoStr = `${proximoAno.getFullYear()}-${String(proximoAno.getMonth() + 1).padStart(2, "0")}-${String(proximoAno.getDate()).padStart(2, "0")}`;

    const dadosValidos = {
      seguradoId: "c3b6bfb5-905e-4b68-8097-f651662495d0",
      numeroApolice: "AP-20120-99",
      tipoSeguro: "EMPRESARIAL",
      valorSeguro: "100000",
      valorPremio: "10000",
      dataInicioVigencia: hojeStr,
      dataFimVigencia: proximoAnoStr,
      coberturas: [
        {
          tipoCobertura: "DANOS_ELETRICOS",
          valorCobertura: "1000",
          valorFranquia: "1000",
        },
      ],
    };

    const resultado = apoliceSchema.safeParse(dadosValidos);
    expect(resultado.success).toBe(true);
  });

  it("deve falhar se número da apólice ou seguradoId não forem informados", () => {
    const dadosInvalidos = {
      seguradoId: "",
      numeroApolice: "",
      tipoSeguro: "AUTO",
      valorSeguro: "1000",
      valorPremio: "100",
      dataInicioVigencia: "2026-10-01",
      dataFimVigencia: "2027-10-01",
    };

    const resultado = apoliceSchema.safeParse(dadosInvalidos);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const erros = resultado.error.format();
      expect(erros.seguradoId?._errors).toBeDefined();
      expect(erros.numeroApolice?._errors).toBeDefined();
    }
  });

  it("deve falhar se dataFimVigencia for anterior a dataInicioVigencia", () => {
    const dadosDataInvalida = {
      seguradoId: "c3b6bfb5-905e-4b68-8097-f651662495d0",
      numeroApolice: "AP-2026-001",
      tipoSeguro: "AUTO",
      valorSeguro: "50000",
      valorPremio: "2000",
      dataInicioVigencia: "2026-10-10",
      dataFimVigencia: "2026-10-05",
    };

    const resultado = apoliceSchema.safeParse(dadosDataInvalida);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(
        resultado.error.issues.some((i) => i.path.includes("dataFimVigencia")),
      ).toBe(true);
    }
  });

  it("deve aceitar a data de hoje como início de vigência", () => {
    const hoje = new Date();
    const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
    const amanha = new Date(hoje.getTime() + 86400000);
    const amanhaStr = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, "0")}-${String(amanha.getDate()).padStart(2, "0")}`;

    const dadosHoje = {
      seguradoId: "c3b6bfb5-905e-4b68-8097-f651662495d0",
      numeroApolice: "AP-2026-HOJE",
      tipoSeguro: "AUTO",
      valorSeguro: "50000",
      valorPremio: "2000",
      dataInicioVigencia: hojeStr,
      dataFimVigencia: amanhaStr,
    };

    const resultado = apoliceSchema.safeParse(dadosHoje);
    expect(resultado.success).toBe(true);
  });
});

