import { describe, expect, it } from "vitest";
import { extrairMensagemErro } from "./errorUtils";

describe("errorUtils", () => {
  it("deve retornar fallback padrão quando o erro for nulo ou indefinido", () => {
    expect(extrairMensagemErro(null)).toBe(
      "Ocorreu um erro ao processar a solicitação.",
    );
    expect(extrairMensagemErro(undefined, "Falha customizada")).toBe(
      "Falha customizada",
    );
  });

  it("deve retornar a própria string quando o erro for uma string", () => {
    expect(extrairMensagemErro("Erro ao conectar")).toBe("Erro ao conectar");
  });

  it("deve extrair message de AxiosError quando presente no response.data", () => {
    const erroAxios = {
      response: {
        status: 400,
        data: {
          message: "Sinistro já finalizado",
        },
      },
    };
    expect(extrairMensagemErro(erroAxios)).toBe("Sinistro já finalizado");
  });

  it("deve extrair campos de erros de validação (objeto)", () => {
    const erroValidacao = {
      response: {
        status: 400,
        data: {
          errors: {
            nome: "não pode ser vazio",
            cpf: "formato inválido",
          },
        },
      },
    };
    expect(extrairMensagemErro(erroValidacao)).toBe(
      "nome: não pode ser vazio | cpf: formato inválido",
    );
  });

  it("deve extrair lista de erros de validação (array)", () => {
    const erroArray = {
      response: {
        status: 400,
        data: {
          errors: ["Campo A inválido", "Campo B obrigatório"],
        },
      },
    };
    expect(extrairMensagemErro(erroArray)).toBe(
      "Campo A inválido, Campo B obrigatório",
    );
  });

  it("deve fornecer fallbacks específicos por código de status HTTP quando sem mensagem no corpo", () => {
    expect(extrairMensagemErro({ response: { status: 401 } })).toContain(
      "Sessão expirada",
    );
    expect(extrairMensagemErro({ response: { status: 403 } })).toContain(
      "Acesso negado",
    );
    expect(extrairMensagemErro({ response: { status: 404 } })).toContain(
      "Recurso não encontrado",
    );
    expect(extrairMensagemErro({ response: { status: 409 } })).toContain(
      "Conflito de dados",
    );
    expect(extrairMensagemErro({ response: { status: 500 } })).toContain(
      "Erro no servidor",
    );
  });

  it("deve extrair message de Error nativo", () => {
    const err = new Error("Falha na rede");
    expect(extrairMensagemErro(err)).toBe("Falha na rede");
  });
});

