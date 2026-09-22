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

export function maskCpf(value?: string | null): string {
  const digits = apenasNumeros(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function maskCnpj(value?: string | null): string {
  const digits = apenasNumeros(value).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function maskCpfCnpj(value?: string | null, tipo?: string): string {
  if (!value) return "";
  const digits = apenasNumeros(value);
  if (tipo === "PF") return maskCpf(digits);
  if (tipo === "PJ") return maskCnpj(digits);
  return digits.length > 11 ? maskCnpj(digits) : maskCpf(digits);
}

export function maskTelefone(value?: string | null): string {
  const digits = apenasNumeros(value).slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function maskCep(value?: string | null): string {
  const digits = apenasNumeros(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatarMoeda(val?: number | string | null): string {
  if (val === undefined || val === null || val === "") return "-";
  const num = typeof val === "number" ? val : Number(val);
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function formatarData(dataStr?: string | null): string {
  if (!dataStr) return "-";
  if (dataStr.includes("-")) {
    const parts = dataStr.split("T")[0].split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dataStr;
}
