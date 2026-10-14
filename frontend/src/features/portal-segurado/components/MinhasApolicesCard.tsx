import React from "react";
import { Link } from "react-router-dom";
import { Badge, Button } from "../../../components/ui";
import { formatarMoeda, formatarData } from "../../../utils/formatters";
import type { Apolice } from "../../../interfaces/apolices/apolice";

interface MinhasApolicesCardProps {
  apolice: Apolice;
}

export const MinhasApolicesCard: React.FC<MinhasApolicesCardProps> = ({
  apolice,
}) => {
  const isAtiva = apolice.status === "ATIVA";

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ATIVA":
        return "success";
      case "CANCELADA":
      case "EXPIRADA":
        return "danger";
      case "SUSPENSA":
        return "warning";
      default:
        return "neutral";
    }
  };

  return (
    <div className="p-5 rounded-(--radius) bg-(--surface) border border-(--border) shadow-xs flex flex-col justify-between hover:border-(--border-strong) hover:shadow-sm transition-all group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-(--muted) font-medium">
            Apólice #{apolice.numeroApolice}
          </span>
          <Badge variant={getStatusBadgeVariant(apolice.status)}>
            {apolice.status}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-(--accent-soft) text-(--accent-ink) flex items-center justify-center shrink-0 border border-(--accent)/20 shadow-2xs">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-base text-(--fg) tracking-tight">
              {apolice.tipoSeguro}
            </h3>
            <p className="text-[11px] text-(--muted) mt-0.5">
              Vigência: {formatarData(apolice.dataInicioVigencia)} até{" "}
              {formatarData(apolice.dataFimVigencia)}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-(--border) space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-(--muted)">Valor do Prêmio</span>
            <span className="font-semibold text-(--fg) font-mono num">
              {formatarMoeda(apolice.valorPremio)}
            </span>
          </div>
          {apolice.valorSeguro != null && (
            <div className="flex items-center justify-between">
              <span className="text-(--muted)">Limite de Cobertura</span>
              <span className="font-semibold text-(--accent-ink) font-mono num">
                {formatarMoeda(apolice.valorSeguro)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-(--border)/60">
        {isAtiva ? (
          <Link
            to={`/portal/sinistros/novo?apoliceId=${apolice.id || ""}`}
            className="block"
          >
            <Button
              variant="primary"
              className="w-full h-10 text-xs font-semibold justify-center shadow-2xs active:scale-[0.99]"
            >
              Acionar Seguro (Abrir Sinistro)
            </Button>
          </Link>
        ) : (
          <Button
            variant="secondary"
            disabled
            className="w-full h-10 text-xs justify-center opacity-60 cursor-not-allowed"
          >
            Apólice Inativa
          </Button>
        )}
      </div>
    </div>
  );
};
