import { useQuery } from "@tanstack/react-query";
import { authApi } from "../../../api/authApi";

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

