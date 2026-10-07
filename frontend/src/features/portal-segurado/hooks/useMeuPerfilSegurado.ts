import { useQuery } from "@tanstack/react-query";
import { seguradoApi } from "../../../api/seguradosApi";


export function useMeuPerfilSegurado() {
  return useQuery({
    queryKey: ["meu-perfil-segurado"],
    queryFn: () => seguradoApi.buscarMeuSegurado(),
  });
}
