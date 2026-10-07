import { useQuery } from "@tanstack/react-query";
import { sinistrosApi } from "../../../api/sinistrosApi"
import type { FiltrosSinistros } from "../../../interfaces/sinistros/filtrosSinistros";

export function useMeusSinistros(seguradoId: string, filtros?: FiltrosSinistros) {
  return useQuery({
    queryKey: ["meus-sinistros", seguradoId, filtros],
    queryFn: () => sinistrosApi.listar({...filtros, seguradoId}),
    enabled: Boolean(seguradoId),
  }); 
}
