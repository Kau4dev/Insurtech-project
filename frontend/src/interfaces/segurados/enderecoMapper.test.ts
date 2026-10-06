import { describe, expect, it } from "vitest";
import { apiParaEndereco, enderecoParaApi } from "./enderecoMapper";

describe("enderecoMapper", () => {
  describe("enderecoParaApi", () => {
    it("deve retornar objeto vazio quando endereco for undefined", () => {
      expect(enderecoParaApi(undefined)).toEqual({});
    });

    it("deve concatenar rua, numero, bairro e complemento em enderecoLogradouro", () => {
      const result = enderecoParaApi({
        rua: "Av. Paulista",
        numero: "1000",
        bairro: "Bela Vista",
        complemento: "Apto 42",
        cidade: "São Paulo",
        uf: "SP",
        cep: "01310100",
      });

      expect(result).toEqual({
        enderecoLogradouro: "Av. Paulista, 1000, Bela Vista, Apto 42",
        enderecoCidade: "São Paulo",
        enderecoUf: "SP",
        enderecoCep: "01310100",
      });
    });

    it("deve ignorar campos em branco ou vazios ao concatenar logradouro", () => {
      const result = enderecoParaApi({
        rua: "Rua das Flores",
        numero: "100",
        bairro: "",
        complemento: "   ",
        cidade: "Campinas",
        uf: "SP",
      });

      expect(result).toEqual({
        enderecoLogradouro: "Rua das Flores, 100",
        enderecoCidade: "Campinas",
        enderecoUf: "SP",
        enderecoCep: undefined,
      });
    });

    it("deve retornar enderecoLogradouro undefined se todos os campos de logradouro forem vazios", () => {
      const result = enderecoParaApi({
        rua: "",
        numero: "",
        bairro: "",
        complemento: "",
        cidade: "Rio de Janeiro",
        uf: "RJ",
      });

      expect(result).toEqual({
        enderecoLogradouro: undefined,
        enderecoCidade: "Rio de Janeiro",
        enderecoUf: "RJ",
        enderecoCep: undefined,
      });
    });
  });

  describe("apiParaEndereco", () => {
    it("deve retornar campos vazios quando logradouro for undefined", () => {
      const result = apiParaEndereco(undefined, "Curitiba", "PR", "80000000");

      expect(result).toEqual({
        rua: "",
        numero: "",
        bairro: "",
        complemento: "",
        cidade: "Curitiba",
        uf: "PR",
        cep: "80000000",
      });
    });

    it("deve desmembrar logradouro com rua, numero, bairro e complemento", () => {
      const result = apiParaEndereco(
        "Av. Paulista, 1000, Bela Vista, Apto 42",
        "São Paulo",
        "SP",
        "01310100",
      );

      expect(result).toEqual({
        rua: "Av. Paulista",
        numero: "1000",
        bairro: "Bela Vista",
        complemento: "Apto 42",
        cidade: "São Paulo",
        uf: "SP",
        cep: "01310100",
      });
    });

    it("deve desmembrar logradouro quando contiver apenas rua e numero", () => {
      const result = apiParaEndereco("Rua das Flores, 100");

      expect(result).toEqual({
        rua: "Rua das Flores",
        numero: "100",
        bairro: "",
        complemento: "",
        cidade: "",
        uf: "",
        cep: "",
      });
    });
  });
});

