import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { notificacoesApi, type NotificacaoResponse } from "../api/notificacoesApi";
import { formatarTempo, mapearTipo, sincronizarNotificacoes, useNotificacoes } from "./useNotificacoes";

vi.mock("../api/notificacoesApi", () => ({
  notificacoesApi: {
    listar: vi.fn(),
    marcarComoLida: vi.fn(),
    marcarTodasComoLidas: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const mockNotificacoes: NotificacaoResponse[] = [
  {
    id: "notif-1",
    seguradoId: "seg-1",
    titulo: "Sinistro Registrado",
    mensagem: "Seu sinistro foi registrado com sucesso",
    tipo: "SINISTRO_REGISTRADO",
    lida: false,
    criadoEm: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5m atrás
  },
  {
    id: "notif-2",
    seguradoId: "seg-1",
    titulo: "Pagamento Liquidado",
    mensagem: "Indenização paga com sucesso",
    tipo: "PAGAMENTO_LIQUIDADO",
    lida: true,
    criadoEm: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h atrás
  },
];

describe("useNotificacoes Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar notificações e calcular naoLidasCount corretamente", async () => {
    vi.mocked(notificacoesApi.listar).mockResolvedValueOnce(mockNotificacoes);

    const { result } = renderHook(() => useNotificacoes({ seguradoId: "seg-1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.notificacoes).toHaveLength(2);
    expect(result.current.naoLidasCount).toBe(1);
    expect(result.current.notificacoes[0].tipo).toBe("info");
    expect(result.current.notificacoes[1].tipo).toBe("sucesso");
  });

  it("deve chamar marcarComoLida na API e atualizar otimisticamente", async () => {
    let dados = [{ ...mockNotificacoes[0] }, { ...mockNotificacoes[1] }];
    vi.mocked(notificacoesApi.listar).mockImplementation(async () => dados);
    vi.mocked(notificacoesApi.marcarComoLida).mockImplementation(async (id) => {
      dados = dados.map((d) => (d.id === id ? { ...d, lida: true } : d));
    });

    const { result } = renderHook(() => useNotificacoes({ seguradoId: "seg-1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.marcarComoLida("notif-1");
    });

    expect(notificacoesApi.marcarComoLida).toHaveBeenCalledWith("notif-1");
    await waitFor(() => expect(result.current.naoLidasCount).toBe(0));
  });

  it("deve chamar marcarTodasComoLidas e zerar naoLidasCount", async () => {
    let dados = [{ ...mockNotificacoes[0] }, { ...mockNotificacoes[1] }];
    vi.mocked(notificacoesApi.listar).mockImplementation(async () => dados);
    vi.mocked(notificacoesApi.marcarTodasComoLidas).mockImplementation(async () => {
      dados = dados.map((d) => ({ ...d, lida: true }));
    });

    const { result } = renderHook(() => useNotificacoes({ seguradoId: "seg-1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.marcarTodasComoLidas();
    });

    expect(notificacoesApi.marcarTodasComoLidas).toHaveBeenCalledWith("seg-1");
    await waitFor(() => expect(result.current.naoLidasCount).toBe(0));
  });

  it("mapearTipo deve mapear corretamente os tipos de notificação", () => {
    expect(mapearTipo("PAGAMENTO_LIQUIDADO")).toBe("sucesso");
    expect(mapearTipo("SINISTRO_REJEITADO")).toBe("alerta");
    expect(mapearTipo("DOCUMENTO_SOLICITADO")).toBe("aviso");
    expect(mapearTipo("SINISTRO_REGISTRADO")).toBe("info");
    expect(mapearTipo("DOCUMENTO_RECEBIDO")).toBe("info");
  });

  it("formatarTempo deve formatar minutos e horas passadas", () => {
    const agora = new Date().toISOString();
    expect(formatarTempo(agora)).toBe("Agora");

    const dezMinutosAtras = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(formatarTempo(dezMinutosAtras)).toBe("10m atrás");

    const duasHorasAtras = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatarTempo(duasHorasAtras)).toBe("2h atrás");
  });

  it("sincronizarNotificacoes deve postar mensagem no BroadcastChannel", () => {
    const postMessageMock = vi.fn();
    const closeMock = vi.fn();
    const originalBC = globalThis.BroadcastChannel;

    class MockBroadcastChannel {
      postMessage = postMessageMock;
      close = closeMock;
    }

    // @ts-expect-error mock BroadcastChannel
    globalThis.BroadcastChannel = MockBroadcastChannel;

    sincronizarNotificacoes();

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "SYNC_NOTIFICACOES" })
    );
    expect(closeMock).toHaveBeenCalled();

    globalThis.BroadcastChannel = originalBC;
  });
});
