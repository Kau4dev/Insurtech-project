import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { seguradoApi } from "../../../api/seguradosApi";
import type { FiltrosSegurados } from "../../../interfaces/segurados/filtrosSegurados";
import type { SeguradoRequest, SeguradoUpdateRequest } from "../../../interfaces/segurados/seguradoRequest";

export const SEGURADOS_QUERY_KEY = ["segurados"] as const;

export function useSegurados(filtros?: FiltrosSegurados) {
  return useQuery({
    queryKey: [...SEGURADOS_QUERY_KEY, filtros],
    queryFn: () => seguradoApi.listar(filtros),
  });
}
export function useCadastrarSegurado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SeguradoRequest) => seguradoApi.cadastrar(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SEGURADOS_QUERY_KEY });
    },
  });
}

export function useSeguradoPorId(id?: string) {
  return useQuery({
    queryKey: [...SEGURADOS_QUERY_KEY, id],
    queryFn: () => seguradoApi.buscarPorId(id!),
    enabled: !!id,
  });
}

export function useAtualizarSegurado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: SeguradoUpdateRequest }) =>
      seguradoApi.atualizar(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SEGURADOS_QUERY_KEY });
    },
  });
}
