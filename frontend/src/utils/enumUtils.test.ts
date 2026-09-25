import { describe, expect, it } from "vitest";
import {
  formatarStatusApolice,
  formatarStatusSinistro,
  formatarTipoDocumento,
  formatarTipoPessoa,
  formatarTipoSeguro,
  formatarTipoSinistro,
  getApoliceStatusBadgeVariant,
  getPessoaTipoBadgeVariant,
  getSinistroStatusBadgeVariant,
  STATUS_APOLICE_OPTIONS,
  STATUS_SINISTRO_OPTIONS,
  TIPO_COBERTURA_OPTIONS,
  TIPO_DOCUMENTO_OPTIONS,
  TIPO_SEGURO_OPTIONS,
  TIPO_SINISTRO_OPTIONS,
} from "./enumUtils";

describe("enumUtils", () => {
  describe("getSinistroStatusBadgeVariant", () => {
    it("deve retornar a variante correta para cada status de sinistro", () => {
      expect(getSinistroStatusBadgeVariant("REGISTRADO")).toBe("neutral");
      expect(getSinistroStatusBadgeVariant("EM_ANALISE")).toBe("warning");
      expect(getSinistroStatusBadgeVariant("AGUARDANDO_DOCUMENTOS")).toBe("warning");
      expect(getSinistroStatusBadgeVariant("APROVADO")).toBe("success");
      expect(getSinistroStatusBadgeVariant("PAGO")).toBe("info");
      expect(getSinistroStatusBadgeVariant("REJEITADO")).toBe("danger");
      expect(getSinistroStatusBadgeVariant("DESCONHECIDO")).toBe("neutral");
    });
  });

  describe("getApoliceStatusBadgeVariant", () => {
    it("deve retornar a variante correta para cada status de apólice", () => {
      expect(getApoliceStatusBadgeVariant("ATIVA")).toBe("success");
      expect(getApoliceStatusBadgeVariant("SUSPENSA")).toBe("warning");
      expect(getApoliceStatusBadgeVariant("CANCELADA")).toBe("danger");
      expect(getApoliceStatusBadgeVariant("EXPIRADA")).toBe("danger");
      expect(getApoliceStatusBadgeVariant("OUTRO")).toBe("neutral");
    });
  });

  describe("getPessoaTipoBadgeVariant", () => {
    it("deve retornar info para PF e purple para PJ", () => {
      expect(getPessoaTipoBadgeVariant("PF")).toBe("info");
      expect(getPessoaTipoBadgeVariant("PJ")).toBe("purple");
    });
  });

  describe("Formatadores de texto", () => {
    it("formatarTipoSinistro deve retornar rótulo amigável", () => {
      expect(formatarTipoSinistro("COLISAO")).toBe("Colisão");
      expect(formatarTipoSinistro("ROUBO_FURTO")).toBe("Roubo / Furto");
      expect(formatarTipoSinistro("INEXISTENTE")).toBe("INEXISTENTE");
      expect(formatarTipoSinistro(null)).toBe("-");
    });

    it("formatarStatusSinistro deve retornar rótulo amigável", () => {
      expect(formatarStatusSinistro("REGISTRADO")).toBe("Registrado");
      expect(formatarStatusSinistro("EM_ANALISE")).toBe("Em Análise");
      expect(formatarStatusSinistro("AGUARDANDO_DOCUMENTOS")).toBe("Aguardando Documentos");
      expect(formatarStatusSinistro(undefined)).toBe("-");
    });

    it("formatarTipoSeguro deve retornar rótulo amigável", () => {
      expect(formatarTipoSeguro("AUTO")).toBe("Automóvel");
      expect(formatarTipoSeguro("RESIDENCIAL")).toBe("Residencial");
      expect(formatarTipoSeguro(null)).toBe("-");
    });

    it("formatarStatusApolice deve retornar rótulo amigável", () => {
      expect(formatarStatusApolice("ATIVA")).toBe("Ativa");
      expect(formatarStatusApolice("EXPIRADA")).toBe("Expirada");
      expect(formatarStatusApolice("")).toBe("-");
    });

    it("formatarTipoPessoa deve retornar Pessoa Física ou Jurídica", () => {
      expect(formatarTipoPessoa("PF")).toBe("Pessoa Física");
      expect(formatarTipoPessoa("PJ")).toBe("Pessoa Jurídica");
      expect(formatarTipoPessoa(null)).toBe("-");
    });

    it("formatarTipoDocumento deve retornar rótulo correto", () => {
      expect(formatarTipoDocumento("BOLETIM_OCORRENCIA")).toBe("Boletim de Ocorrência");
      expect(formatarTipoDocumento("FOTO_DANO")).toBe("Fotos dos Danos");
      expect(formatarTipoDocumento("LAUDO_TECNICO")).toBe("Laudo Técnico / Pericial");
      expect(formatarTipoDocumento(null)).toBe("-");
    });
  });

  describe("Constantes de opções", () => {
    it("deve conter opções válidas e não vazias", () => {
      expect(TIPO_SINISTRO_OPTIONS.length).toBeGreaterThan(0);
      expect(STATUS_SINISTRO_OPTIONS.length).toBeGreaterThan(0);
      expect(TIPO_SEGURO_OPTIONS.length).toBeGreaterThan(0);
      expect(STATUS_APOLICE_OPTIONS.length).toBeGreaterThan(0);
      expect(TIPO_COBERTURA_OPTIONS.length).toBeGreaterThan(0);
      expect(TIPO_DOCUMENTO_OPTIONS.length).toBeGreaterThan(0);
    });
  });
});

