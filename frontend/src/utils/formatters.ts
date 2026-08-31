/**
 * Utilitários para formatação e limpeza de documentos e dados cadastrais brasileiros
 */

export function apenasNumeros(valor?: string | null): string {
  if (!valor) return "";
  return valor.replace(/\D/g, "");
}

export function formatarCpf(cpf: string): string {
  const limpo = apenasNumeros(cpf);
  if (limpo.length !== 11) return cpf;
  return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatarCnpj(cnpj: string): string {
  const limpo = apenasNumeros(cnpj);
  if (limpo.length !== 14) return cnpj;
  return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

export function formatarCpfCnpj(valor?: string | null, tipo?: string): string {
  if (!valor) return "-";
  const limpo = apenasNumeros(valor);
  if (tipo === "PF" || limpo.length === 11) {
    return formatarCpf(limpo);
  }
  if (tipo === "PJ" || limpo.length === 14) {
    return formatarCnpj(limpo);
  }
  return valor;
}

export function formatarTelefone(telefone?: string | null): string {
  if (!telefone) return "-";
  const limpo = apenasNumeros(telefone);
  if (limpo.length === 11) {
    return limpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (limpo.length === 10) {
    return limpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return telefone;
}

export function formatarCep(cep?: string | null): string {
  if (!cep) return "-";
  const limpo = apenasNumeros(cep);
  if (limpo.length === 8) {
    return limpo.replace(/(\d{5})(\d{3})/, "$1-$2");
  }
  return cep;
}
