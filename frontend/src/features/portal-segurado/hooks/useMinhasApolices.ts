import { useQuery } from "@tanstack/react-query";
import { apolicesApi } from "../../../api/apolicesApi"
import type { FiltrosApolices } from "../../../interfaces/apolices/filtrosApolices";

export function useMinhasApolices(seguradoId: string, filtros?: FiltrosApolices) {
  return useQuery({
    queryKey: ["minhas-apolices", seguradoId, filtros],
    queryFn: () => apolicesApi.listar({...filtros, seguradoId}),
    enabled: Boolean(seguradoId),
  });
}