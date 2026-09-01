import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apolicesApi } from "../../../api/apolicesApi"
import type { FiltrosApolices } from "../../../interfaces/apolices/filtrosApolices";
import type { StatusApolice } from "../../../interfaces/enums";

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

export function useApolicePorId(id?: string) {
  return useQuery({
    queryKey: ["apolices", id],
    queryFn: () => apolicesApi.buscarPorId(id!),
    enabled: !!id,
  });
}

export function useAtualizarStatus() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn:  ({ id, status }: { id: string; status: StatusApolice }) => apolicesApi.atualizarStatus(id, status),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["apolices"] }),
    });
  }

