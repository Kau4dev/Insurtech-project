import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sinistrosApi } from "../../../api/sinistrosApi"
import type { FiltrosSinistros } from "../../../interfaces/sinistros/filtrosSinistros";

export function useSinistros(filtros?: FiltrosSinistros) {
  return useQuery({
    queryKey: ["sinistros", filtros],
    queryFn: () => sinistrosApi.listar(filtros),
  });
}

export function useCriarSinistro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sinistrosApi.cadastrar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sinistros"] }),
  });
}
