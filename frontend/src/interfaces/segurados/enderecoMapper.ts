import type { Endereco } from "./endereco";

export function enderecoParaApi(e: Endereco | undefined) {
  if (!e) return {};
  const logradouro = [
    e.rua?.trim(),
    e.numero?.trim(),
    e.bairro?.trim(),
    e.complemento?.trim(),
  ]
    .filter((val): val is string => Boolean(val && val.length > 0))
    .join(", ");

  return {
    enderecoLogradouro: logradouro.length > 0 ? logradouro : undefined,
    enderecoCidade: e.cidade?.trim() || undefined,
    enderecoUf: e.uf?.trim() || undefined,
    enderecoCep: e.cep?.trim() || undefined,
  };
}

export function apiParaEndereco(
  logradouro?: string,
  cidade?: string,
  uf?: string,
  cep?: string,
): Endereco {
  if (!logradouro) {
    return {
      rua: "",
      numero: "",
      bairro: "",
      complemento: "",
      cidade: cidade || "",
      uf: uf || "",
      cep: cep || "",
    };
  }

  const partes = logradouro.split(",").map((p) => p.trim());
  return {
    rua: partes[0] || "",
    numero: partes[1] || "",
    bairro: partes[2] || "",
    complemento: partes.slice(3).join(", ") || "",
    cidade: cidade || "",
    uf: uf || "",
    cep: cep || "",
  };
}