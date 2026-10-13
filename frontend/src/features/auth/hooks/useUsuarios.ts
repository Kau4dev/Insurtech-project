import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../../api/authApi";
import type { CadastrarUsuarioRequest } from "../../../interfaces/auth/usuario";

export const USUARIOS_QUERY_KEY = ["usuarios"] as const;

export function useUsuarioPorId(id?: string | null) {
  return useQuery({
    queryKey: [...USUARIOS_QUERY_KEY, id],
    queryFn: () => authApi.buscarUsuario(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutos de cache
    gcTime: 1000 * 60 * 30,
  });
}

export function useUsuarios(ativo?: boolean) {
  return useQuery({
    queryKey: [...USUARIOS_QUERY_KEY, { ativo }],
    queryFn: () => authApi.listarUsuarios(ativo),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });
}

export function useCadastrarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CadastrarUsuarioRequest) => authApi.cadastrarUsuario(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
    },
  });
}

export function useInativarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => authApi.inativarUsuario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
    },
  });
}

export function useReativarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => authApi.reativarUsuario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
    },
  });
}


