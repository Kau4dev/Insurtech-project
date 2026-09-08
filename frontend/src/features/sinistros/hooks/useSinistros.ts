import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sinistrosApi } from "../../../api/sinistrosApi";
import type { DocumentoSinistroRequest } from "../../../interfaces/sinistros/documentoSinistroRequest";
import type { FiltrosSinistros } from "../../../interfaces/sinistros/filtrosSinistros";
import type {
  AprovarSinistro,
  RejeitarSinistro,
  SinistroRequest,
} from "../../../interfaces/sinistros/sinistroRequest";
export function useSinistros(filtros?: FiltrosSinistros) {
  return useQuery({
    queryKey: ["sinistros", filtros],
    queryFn: () => sinistrosApi.listar(filtros),
  });
}

export function useCadastrarSinistro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SinistroRequest) => sinistrosApi.cadastrar(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sinistros"] }),
  });
}

export function useSinistroPorId(id?: string) {
  return useQuery({
    queryKey: ["sinistros", id],
    queryFn: () => sinistrosApi.buscarPorId(id!),
    enabled: !!id,
  });
}

export function useAtribuirAnalista() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, analistaId }: { id: string; analistaId: string }) =>
      sinistrosApi.atribuirAnalista(id, analistaId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sinistros"] }),
  });
}

export function useAguardarDocumentos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sinistrosApi.aguardarDocumentos(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sinistros"] }),
  });
}

export function useAprovarSinistro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AprovarSinistro }) =>
      sinistrosApi.aprovar(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sinistros"] }),
  });
}

export function useRejeitarSinistro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RejeitarSinistro }) =>
      sinistrosApi.rejeitar(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sinistros"] }),
  });
}

export function useAdicionarDocumento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: DocumentoSinistroRequest }) =>
      sinistrosApi.adicionarDocumento(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sinistros"] }),
  });
}

export function useHistoricoSinistro(id?: string) {
  return useQuery({
    queryKey: ["sinistros", id, "historico"],
    queryFn: () => sinistrosApi.mostrarHistorico(id!),
    enabled: !!id,
  });
}
