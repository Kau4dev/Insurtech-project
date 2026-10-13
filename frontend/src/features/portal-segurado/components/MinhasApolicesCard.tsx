import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui";
import { formatarMoeda, formatarData } from "../../../utils/formatters";
import type { Apolice } from "../../../interfaces/apolices/apolice";

interface MinhasApolicesCardProps {
  apolice: Apolice;
}

export const MinhasApolicesCard: React.FC<MinhasApolicesCardProps> = ({ apolice }) => {
  const isAtiva = apolice.status === "ATIVA";

  return (
    <div className="p-5 rounded-xl bg-(--surface) border border-(--border) shadow-xs flex flex-col justify-between hover:border-(--border-strong) transition-colors">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-(--muted)">Apólice #{apolice.numeroApolice}</span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              isAtiva
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
            }`}
          >
            {apolice.status}
          </span>
        </div>
        <h3 className="font-bold text-lg text-(--fg)">{apolice.tipoSeguro}</h3>
        <p className="text-xs text-(--muted) mt-1">
          Vigência: {formatarData(apolice.dataInicioVigencia)} até {formatarData(apolice.dataFimVigencia)}
        </p>

        <div className="mt-4 pt-3 border-t border-(--border) flex items-center justify-between text-sm">
          <span className="text-xs text-(--muted)">Valor do Prêmio</span>
          <span className="font-bold text-(--fg)">{formatarMoeda(apolice.valorPremio)}</span>
        </div>
        {apolice.valorSeguro && (
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-(--muted)">Limite de Cobertura</span>
            <span className="font-medium text-(--fg)">{formatarMoeda(apolice.valorSeguro)}</span>
          </div>
        )}
      </div>

      <div className="mt-5">
        {isAtiva ? (
          <Link to={`/portal/sinistros/novo?apoliceId=${apolice.id || ""}`}>
            <Button variant="primary" className="w-full">
              Acionar Seguro (Abrir Sinistro)
            </Button>
          </Link>
        ) : (
          <Button variant="secondary" disabled className="w-full">
            Apólice Inativa
          </Button>
        )}
      </div>
    </div>
  );
};

