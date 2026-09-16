import type { BadgeVariant } from "../components/ui/Badge";
import type {
  StatusApolice,
  StatusSinistro,
  TipoCobertura,
  TipoPessoa,
  TipoSeguro,
  TipoSinistro,
} from "../interfaces/enums";

// ==========================================
// BADGE VARIANTS (Formatadores de Cor do Badge)
// ==========================================

export function getSinistroStatusBadgeVariant(
  status: StatusSinistro | string,
): BadgeVariant {
  switch (status) {
    case "REGISTRADO":
      return "neutral";
    case "EM_ANALISE":
    case "AGUARDANDO_DOCUMENTOS":
      return "warning";
    case "APROVADO":
      return "success";
    case "PAGO":
      return "info";
    case "REJEITADO":
      return "danger";
    default:
      return "neutral";
  }
}

export function getApoliceStatusBadgeVariant(
  status: StatusApolice | string,
): BadgeVariant {
  switch (status) {
    case "ATIVA":
      return "success";
    case "SUSPENSA":
      return "warning";
    case "CANCELADA":
    case "EXPIRADA":
      return "danger";
    default:
      return "neutral";
  }
}

export function getPessoaTipoBadgeVariant(
  tipoPessoa: TipoPessoa | string,
): BadgeVariant {
  return tipoPessoa === "PF" ? "info" : "purple";
}

// ==========================================
// OPTIONS (Listas de opções para Selects e Filtros)
// ==========================================

export const TIPO_SINISTRO_OPTIONS: { value: TipoSinistro; label: string }[] = [
  { value: "COLISAO", label: "Colisão" },
  { value: "ROUBO_FURTO", label: "Roubo / Furto" },
  { value: "INCENDIO", label: "Incêndio" },
  { value: "DANO_A_TERCEIRO", label: "Danos a Terceiros" },
  { value: "ALAGAMENTO", label: "Alagamento" },
  { value: "QUEBRA_DE_VIDRO", label: "Quebra de Vidros" },
  { value: "OUTROS", label: "Outros" },
];

export const STATUS_SINISTRO_OPTIONS: {
  value: StatusSinistro;
  label: string;
}[] = [
  { value: "REGISTRADO", label: "Registrado" },
  { value: "EM_ANALISE", label: "Em Análise" },
  { value: "AGUARDANDO_DOCUMENTOS", label: "Aguardando Documentos" },
  { value: "APROVADO", label: "Aprovado" },
  { value: "REJEITADO", label: "Rejeitado" },
  { value: "PAGO", label: "Pago" },
];

export const TIPO_SEGURO_OPTIONS: { value: TipoSeguro; label: string }[] = [
  { value: "AUTO", label: "Automóvel" },
  { value: "RESIDENCIAL", label: "Residencial" },
  { value: "VIDA", label: "Vida" },
  { value: "PATRIMONIAL", label: "Patrimonial" },
  { value: "EMPRESARIAL", label: "Empresarial" },
];

export const STATUS_APOLICE_OPTIONS: {
  value: StatusApolice;
  label: string;
}[] = [
  { value: "ATIVA", label: "Ativa" },
  { value: "SUSPENSA", label: "Suspensa" },
  { value: "CANCELADA", label: "Cancelada" },
  { value: "EXPIRADA", label: "Expirada" },
];

export const TIPO_COBERTURA_OPTIONS: {
  value: TipoCobertura;
  label: string;
}[] = [
  { value: "COLISAO", label: "Colisão" },
  { value: "ROUBO_FURTO", label: "Roubo e Furto" },
  { value: "INCENDIO_VEICULO", label: "Incêndio Veículo" },
  { value: "DANO_A_TERCEIRO", label: "Danos a Terceiros" },
  { value: "QUEBRA_DE_VIDRO", label: "Quebra de Vidros" },
  { value: "INCENDIO_RESIDENCIAL", label: "Incêndio Residencial" },
  { value: "DANOS_ELETRICOS", label: "Danos Elétricos" },
  { value: "ROUBO_BENS", label: "Roubo de Bens" },
  { value: "ALAGAMENTO", label: "Alagamento" },
  { value: "MORTE", label: "Morte" },
  { value: "INVALIDEZ_PERMANENTE", label: "Invalidez Permanente" },
  { value: "DOENCA_GRAVE", label: "Doença Grave" },
  { value: "DANO_EQUIPAMENTO", label: "Dano a Equipamento" },
  { value: "LUCROS_CESSANTES", label: "Lucros Cessantes" },
  { value: "RESPONSABILIDADE_CIVIL", label: "Responsabilidade Civil" },
  { value: "OUTROS", label: "Outros" },
];

// ==========================================
// LABELS (Formatadores para Exibição Amigável)
// ==========================================

export function formatarTipoSinistro(tipo?: string | null): string {
  if (!tipo) return "-";
  const item = TIPO_SINISTRO_OPTIONS.find((o) => o.value === tipo);
  return item ? item.label : tipo;
}

export function formatarStatusSinistro(status?: string | null): string {
  if (!status) return "-";
  const item = STATUS_SINISTRO_OPTIONS.find((o) => o.value === status);
  return item ? item.label : status;
}

export function formatarTipoSeguro(tipo?: string | null): string {
  if (!tipo) return "-";
  const item = TIPO_SEGURO_OPTIONS.find((o) => o.value === tipo);
  return item ? item.label : tipo;
}

export function formatarStatusApolice(status?: string | null): string {
  if (!status) return "-";
  const item = STATUS_APOLICE_OPTIONS.find((o) => o.value === status);
  return item ? item.label : status;
}

export function formatarTipoPessoa(tipo?: string | null): string {
  if (!tipo) return "-";
  return tipo === "PF"
    ? "Pessoa Física"
    : tipo === "PJ"
      ? "Pessoa Jurídica"
      : tipo;
}
