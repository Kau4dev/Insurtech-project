import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { seguradoApi } from "../../../api/seguradosApi";
import type { FiltrosSegurados } from "../../../interfaces/segurados/filtrosSegurados";

export function useSegurados(filtros?: FiltrosSegurados) {
  return useQuery({
    queryKey: ["segurados", filtros],
    queryFn: () => seguradoApi.listar(filtros),
  });
}

export function useCriarSegurado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seguradoApi.cadastrar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["segurados"] }),
  });
}
