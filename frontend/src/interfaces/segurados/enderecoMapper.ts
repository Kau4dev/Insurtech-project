import type { Endereco } from "./endereco";

export function enderecoParaApi(e: Endereco | undefined) {
  if (!e) return {};
  const logradouro = [e.rua, e.numero, e.bairro, e.complemento]
    .filter(Boolean).join(', ');
  return {
    enderecoLogradouro: logradouro,
    enderecoCidade: e.cidade,
    enderecoUf: e.uf,
    enderecoCep: e.cep,
  };
}