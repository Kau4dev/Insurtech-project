import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { notificacoesApi, type NotificacaoResponse } from "../api/notificacoesApi";

export interface NotificacaoItem {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "sucesso" | "info" | "alerta" | "aviso";
  tempo: string;
  lida: boolean;
  link?: string;
  criadoEm?: string;
}

export interface UseNotificacoesOptions {
  portalMode?: boolean;
  seguradoId?: string;
  pollingIntervalMs?: number;
  enabled?: boolean;
}

export function mapearTipo(tipo: NotificacaoResponse["tipo"]): NotificacaoItem["tipo"] {
  switch (tipo) {
    case "PAGAMENTO_LIQUIDADO":
      return "sucesso";
    case "SINISTRO_REJEITADO":
      return "alerta";
    case "DOCUMENTO_SOLICITADO":
      return "aviso";
    case "DOCUMENTO_RECEBIDO":
    case "SINISTRO_REGISTRADO":
    default:
      return "info";
  }
}

export function formatarTempo(isoString: string): string {
  try {
    const data = new Date(isoString);
    const diffMs = Date.now() - data.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Agora";
    if (diffMin < 60) return `${diffMin}m atrás`;
    const diffHoras = Math.floor(diffMin / 60);
    if (diffHoras < 24) return `${diffHoras}h atrás`;
    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  } catch {
    return "";
  }
}

const NOTIFICACOES_CHANNEL_NAME = "insurtech_notificacoes_channel";

export function sincronizarNotificacoes() {
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(NOTIFICACOES_CHANNEL_NAME);
      channel.postMessage({ type: "SYNC_NOTIFICACOES", timestamp: Date.now() });
      channel.close();
    }
  } catch {
    // Falha silenciosa em navegadores/ambientes sem suporte completo
  }
}

export function useNotificacoes({
  portalMode = false,
  seguradoId,
  pollingIntervalMs = 3000,
  enabled = true,
}: UseNotificacoesOptions = {}) {
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => ["notificacoes", portalMode ? "portal" : "interno", seguradoId ?? "todos"],
    [portalMode, seguradoId],
  );

  const query = useQuery({
    queryKey,
    queryFn: () => notificacoesApi.listar(seguradoId),
    enabled: enabled && (!portalMode || !!seguradoId),
    refetchInterval: pollingIntervalMs,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Sincronização em tempo real entre abas abertas simultaneamente
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(NOTIFICACOES_CHANNEL_NAME);
      channel.onmessage = (event: MessageEvent) => {
        if (event.data?.type === "SYNC_NOTIFICACOES") {
          queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
        }
      };
    } catch {
      // Ignora erro de inicialização
    }

    return () => {
      try {
        channel?.close();
      } catch {
        // Ignora erro ao fechar
      }
    };
  }, [queryClient]);

  const marcarComoLidaMutation = useMutation({
    mutationFn: (id: string) => notificacoesApi.marcarComoLida(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificacaoResponse[]>(queryKey);
      queryClient.setQueryData<NotificacaoResponse[]>(queryKey, (old = []) =>
        old.map((n) => (n.id === id ? { ...n, lida: true } : n)),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
      sincronizarNotificacoes();
    },
  });

  const marcarTodasComoLidasMutation = useMutation({
    mutationFn: () => notificacoesApi.marcarTodasComoLidas(seguradoId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificacaoResponse[]>(queryKey);
      queryClient.setQueryData<NotificacaoResponse[]>(queryKey, (old = []) =>
        old.map((n) => ({ ...n, lida: true })),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
      sincronizarNotificacoes();
    },
  });

  const notificacoes: NotificacaoItem[] = useMemo(() => {
    return (query.data || []).map((n) => ({
      id: n.id,
      titulo: n.titulo,
      descricao: n.mensagem,
      tipo: mapearTipo(n.tipo),
      tempo: formatarTempo(n.criadoEm),
      lida: n.lida,
      link: portalMode ? "/portal" : "/sinistros",
      criadoEm: n.criadoEm,
    }));
  }, [query.data, portalMode]);

  const naoLidasCount = useMemo(() => {
    return notificacoes.filter((n) => !n.lida).length;
  }, [notificacoes]);

  return {
    notificacoes,
    naoLidasCount,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    marcarComoLida: (id: string) => marcarComoLidaMutation.mutate(id),
    marcarTodasComoLidas: () => marcarTodasComoLidasMutation.mutate(),
  };
}
