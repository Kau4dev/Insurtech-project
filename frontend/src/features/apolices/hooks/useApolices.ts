import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apolicesApi } from "../../../api/apolicesApi"
import type { FiltrosApolices } from "../../../interfaces/apolices/filtrosApolices";

export function useApolices(filtros?: FiltrosApolices) {
  return useQuery({
    queryKey: ["apolices", filtros],
    queryFn: () => apolicesApi.listar(filtros),
  });
}

export function useCadastrarApolice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apolicesApi.cadastrar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["apolices"] }),
  });
}
