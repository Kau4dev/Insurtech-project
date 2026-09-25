import { describe, expect, it } from "vitest";
import {
  apenasNumeros,
  formatarCep,
  formatarCnpj,
  formatarCpf,
  formatarCpfCnpj,
  formatarData,
  formatarMoeda,
  formatarTelefone,
  maskCep,
  maskCnpj,
  maskCpf,
  maskCpfCnpj,
  maskTelefone,
} from "./formatters";

describe("formatters utils", () => {
  describe("apenasNumeros", () => {
    it("deve remover caracteres não numéricos", () => {
      expect(apenasNumeros("123.456.789-00")).toBe("12345678900");
      expect(apenasNumeros("(11) 98765-4321")).toBe("11987654321");
      expect(apenasNumeros("abc-123_xyz")).toBe("123");
    });

    it("deve retornar string vazia para valores nulos ou vazios", () => {
      expect(apenasNumeros(null)).toBe("");
      expect(apenasNumeros(undefined)).toBe("");
      expect(apenasNumeros("")).toBe("");
    });
  });

  describe("formatarCpf", () => {
    it("deve formatar CPF válido com 11 dígitos", () => {
      expect(formatarCpf("12345678901")).toBe("123.456.789-01");
    });

    it("deve retornar o valor original se não tiver 11 dígitos", () => {
      expect(formatarCpf("123456")).toBe("123456");
      expect(formatarCpf("12345678901234")).toBe("12345678901234");
    });
  });

  describe("formatarCnpj", () => {
    it("deve formatar CNPJ válido com 14 dígitos", () => {
      expect(formatarCnpj("12345678000195")).toBe("12.345.678/0001-95");
    });

    it("deve retornar o valor original se não tiver 14 dígitos", () => {
      expect(formatarCnpj("12345")).toBe("12345");
    });
  });

  describe("formatarCpfCnpj", () => {
    it("deve formatar CPF quando comprimento for 11 ou tipo for PF", () => {
      expect(formatarCpfCnpj("12345678901")).toBe("123.456.789-01");
      expect(formatarCpfCnpj("12345678901", "PF")).toBe("123.456.789-01");
    });

    it("deve formatar CNPJ quando comprimento for 14 ou tipo for PJ", () => {
      expect(formatarCpfCnpj("12345678000195")).toBe("12.345.678/0001-95");
      expect(formatarCpfCnpj("12345678000195", "PJ")).toBe("12.345.678/0001-95");
    });

    it("deve retornar '-' quando valor for nulo ou vazio", () => {
      expect(formatarCpfCnpj(null)).toBe("-");
      expect(formatarCpfCnpj(undefined)).toBe("-");
      expect(formatarCpfCnpj("")).toBe("-");
    });
  });

  describe("formatarTelefone", () => {
    it("deve formatar celular com 11 dígitos", () => {
      expect(formatarTelefone("11987654321")).toBe("(11) 98765-4321");
    });

    it("deve formatar fixo com 10 dígitos", () => {
      expect(formatarTelefone("1134567890")).toBe("(11) 3456-7890");
    });

    it("deve retornar '-' para valor nulo", () => {
      expect(formatarTelefone(null)).toBe("-");
    });
  });

  describe("formatarCep", () => {
    it("deve formatar CEP com 8 dígitos", () => {
      expect(formatarCep("01310100")).toBe("01310-100");
    });

    it("deve retornar '-' para valor nulo", () => {
      expect(formatarCep(null)).toBe("-");
    });
  });

  describe("Máscaras dinâmicas (inputs)", () => {
    it("maskCpf deve formatar progressivamente", () => {
      expect(maskCpf("123")).toBe("123");
      expect(maskCpf("1234")).toBe("123.4");
      expect(maskCpf("1234567")).toBe("123.456.7");
      expect(maskCpf("12345678901")).toBe("123.456.789-01");
    });

    it("maskCnpj deve formatar progressivamente", () => {
      expect(maskCnpj("12")).toBe("12");
      expect(maskCnpj("12345")).toBe("12.345");
      expect(maskCnpj("12345678")).toBe("12.345.678");
      expect(maskCnpj("12345678000195")).toBe("12.345.678/0001-95");
    });

    it("maskCpfCnpj deve selecionar a máscara correta", () => {
      expect(maskCpfCnpj("12345678901", "PF")).toBe("123.456.789-01");
      expect(maskCpfCnpj("12345678000195", "PJ")).toBe("12.345.678/0001-95");
      expect(maskCpfCnpj("")).toBe("");
    });

    it("maskTelefone deve aplicar parênteses e traço", () => {
      expect(maskTelefone("11")).toBe("(11");
      expect(maskTelefone("11987654321")).toBe("(11) 98765-4321");
      expect(maskTelefone("")).toBe("");
    });

    it("maskCep deve aplicar traço após 5 dígitos", () => {
      expect(maskCep("01310")).toBe("01310");
      expect(maskCep("01310100")).toBe("01310-100");
    });
  });

  describe("formatarMoeda", () => {
    it("deve formatar valor numérico em reais", () => {
      const res = formatarMoeda(1500.5);
      expect(res).toContain("1.500,50");
    });

    it("deve formatar string numérica", () => {
      const res = formatarMoeda("250");
      expect(res).toContain("250,00");
    });

    it("deve retornar '-' para valores nulos, vazios ou inválidos", () => {
      expect(formatarMoeda(null)).toBe("-");
      expect(formatarMoeda(undefined)).toBe("-");
      expect(formatarMoeda("")).toBe("-");
      expect(formatarMoeda("abc")).toBe("-");
    });
  });

  describe("formatarData", () => {
    it("deve formatar ISO date (YYYY-MM-DD) para DD/MM/YYYY", () => {
      expect(formatarData("2026-09-24")).toBe("24/09/2026");
      expect(formatarData("2026-09-24T15:30:00Z")).toBe("24/09/2026");
    });

    it("deve retornar '-' para valor nulo ou indefinido", () => {
      expect(formatarData(null)).toBe("-");
      expect(formatarData(undefined)).toBe("-");
    });
  });
});
