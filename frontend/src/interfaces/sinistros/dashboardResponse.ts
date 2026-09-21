import type { StatusSinistro } from "../enums";

export interface DashboardResponse {
  contagemPorStatus: Partial<Record<StatusSinistro, number>>;
  valorTotalEmAnalise: number;
  valorTotalAprovado: number;
  totalSinistros: number;
}

