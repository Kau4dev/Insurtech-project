import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apolicesApi } from "../../../api/apolicesApi";
import { seguradoApi } from "../../../api/seguradosApi";
import { sinistrosApi } from "../../../api/sinistrosApi";
import type { StatusSinistro } from "../../../interfaces/enums";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";

export function useDashboardData() {
  // 1. Resumo oficial do backend (ou cálculo automático caso sem permissão)
  const resumoQuery = useQuery({
    queryKey: ["dashboard", "resumo"],
    queryFn: () => sinistrosApi.obterDashboard(),
  });

  // 2. Lista completa de sinistros para cálculos analíticos em tempo real
  const sinistrosQuery = useQuery({
    queryKey: ["sinistros", "dashboard-lista"],
    queryFn: () => sinistrosApi.listar({ size: 100 }),
  });

  // 3. Segurados para resolução dinâmica de nomes
  const seguradosQuery = useQuery({
    queryKey: ["segurados", "dashboard-lista"],
    queryFn: () => seguradoApi.listar({ size: 100 }),
  });

  // 4. Apólices para resolução dinâmica de códigos de apólice
  const apolicesQuery = useQuery({
    queryKey: ["apolices", "dashboard-lista"],
    queryFn: () => apolicesApi.listar({ size: 100 }),
  });

  const todosSinistros: Sinistro[] = useMemo(
    () => sinistrosQuery.data?.content || [],
    [sinistrosQuery.data],
  );

  // Mapas de pesquisa rápida O(1)
  const seguradosMap = useMemo(() => {
    const map = new Map<string, string>();
    (seguradosQuery.data?.content || []).forEach((s) => {
      if (s.id) map.set(s.id, s.nomeRazaoSocial);
    });
    return map;
  }, [seguradosQuery.data]);

  const apolicesMap = useMemo(() => {
    const map = new Map<string, string>();
    (apolicesQuery.data?.content || []).forEach((a) => {
      if (a.id) map.set(a.id, a.numeroApolice);
    });
    return map;
  }, [apolicesQuery.data]);

  // Contagem dinâmica por status
  const contagemPorStatus = useMemo<
    Partial<Record<StatusSinistro, number>>
  >(() => {
    if (
      resumoQuery.data?.contagemPorStatus &&
      Object.keys(resumoQuery.data.contagemPorStatus).length > 0
    ) {
      return resumoQuery.data.contagemPorStatus;
    }

    const counts: Partial<Record<StatusSinistro, number>> = {
      REGISTRADO: 0,
      EM_ANALISE: 0,
      AGUARDANDO_DOCUMENTOS: 0,
      APROVADO: 0,
      PAGO: 0,
      REJEITADO: 0,
    };

    todosSinistros.forEach((s) => {
      counts[s.status] = (counts[s.status] || 0) + 1;
    });

    return counts;
  }, [resumoQuery.data, todosSinistros]);

  // Total geral de sinistros
  const totalSinistros = useMemo(() => {
    if (
      resumoQuery.data?.totalSinistros !== undefined &&
      resumoQuery.data.totalSinistros !== null
    ) {
      return resumoQuery.data.totalSinistros;
    }
    return todosSinistros.length;
  }, [resumoQuery.data, todosSinistros]);

  // Sinistros em análise
  const totalEmAnalise = useMemo(() => {
    return (
      contagemPorStatus.EM_ANALISE ??
      todosSinistros.filter((s) => s.status === "EM_ANALISE").length ??
      0
    );
  }, [contagemPorStatus, todosSinistros]);

  // Valor total liquidado (Aprovados + Pagos)
  const valorTotalLiquidado = useMemo(() => {
    if (
      resumoQuery.data?.valorTotalAprovado !== undefined &&
      resumoQuery.data.valorTotalAprovado !== null
    ) {
      return resumoQuery.data.valorTotalAprovado;
    }

    return todosSinistros
      .filter((s) => s.status === "APROVADO" || s.status === "PAGO")
      .reduce(
        (acc, curr) => acc + (curr.valorAprovado || curr.valorEstimado || 0),
        0,
      );
  }, [resumoQuery.data, todosSinistros]);

  // Tempo médio dinâmico de resolução baseado no histórico de sinistros finalizados
  const tempoMedioDias = useMemo(() => {
    const finalizados = todosSinistros.filter(
      (s) =>
        s.status === "APROVADO" ||
        s.status === "PAGO" ||
        s.status === "REJEITADO",
    );

    if (finalizados.length === 0) return "—";

    const somaDias = finalizados.reduce((acc, s) => {
      if (!s.createdAt || !s.updatedAt) return acc + 1;
      const diffMs =
        new Date(s.updatedAt).getTime() - new Date(s.createdAt).getTime();
      const dias = Math.max(0.5, diffMs / (1000 * 60 * 60 * 24));
      return acc + dias;
    }, 0);

    const media = (somaDias / finalizados.length).toFixed(1);
    return `${media.replace(".", ",")} dias`;
  }, [todosSinistros]);

  // Variação percentual dinâmica de sinistros registrados no mês
  const variacaoMesAnterior = useMemo(() => {
    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();
    const prevDate = new Date(curYear, curMonth - 1, 1);
    const prevMonth = prevDate.getMonth();
    const prevYear = prevDate.getFullYear();

    const doMes = todosSinistros.filter((s) => {
      const d = new Date(s.createdAt || s.dataOcorrencia);
      return (
        !isNaN(d.getTime()) &&
        d.getMonth() === curMonth &&
        d.getFullYear() === curYear
      );
    }).length;

    const doMesAnt = todosSinistros.filter((s) => {
      const d = new Date(s.createdAt || s.dataOcorrencia);
      return (
        !isNaN(d.getTime()) &&
        d.getMonth() === prevMonth &&
        d.getFullYear() === prevYear
      );
    }).length;

    if (doMesAnt > 0) {
      const pct = Math.round(((doMes - doMesAnt) / doMesAnt) * 100);
      return `${pct >= 0 ? "▲" : "▼"} ${Math.abs(pct)}%`;
    }
    return doMes > 0 ? "Novo" : "—";
  }, [todosSinistros]);

  // Fila de trabalho enriquecida com os dados reais dos segurados e apólices (ordenada e limitada a 6)
  const filaTrabalho = useMemo(() => {
    const ordenados = [...todosSinistros].sort((a, b) => {
      const tA = new Date(a.createdAt || a.dataOcorrencia).getTime() || 0;
      const tB = new Date(b.createdAt || b.dataOcorrencia).getTime() || 0;
      return tB - tA;
    });

    return ordenados.slice(0, 6).map((s) => ({
      ...s,
      numeroApolice:
        apolicesMap.get(s.apoliceId) ||
        (s.apoliceId && s.apoliceId.startsWith("AP-")
          ? s.apoliceId
          : s.apoliceId
            ? `AP-${s.apoliceId.slice(0, 8)}`
            : undefined),
      seguradoNome:
        seguradosMap.get(s.seguradoId) ||
        (s.seguradoId ? `Segurado ${s.seguradoId.slice(0, 6)}` : "Segurado"),
    }));
  }, [todosSinistros, seguradosMap, apolicesMap]);

  // Sinistro mais recente para o ciclo de emissão
  const ultimoSinistro = useMemo(() => {
    if (todosSinistros.length === 0) return undefined;
    const sorted = [...todosSinistros].sort((a, b) => {
      const tA = new Date(a.createdAt || a.dataOcorrencia).getTime() || 0;
      const tB = new Date(b.createdAt || b.dataOcorrencia).getTime() || 0;
      return tB - tA;
    });
    const item = sorted[0];
    return {
      ...item,
      seguradoNome: seguradosMap.get(item.seguradoId),
    };
  }, [todosSinistros, seguradosMap]);

  const isLoading =
    resumoQuery.isLoading ||
    sinistrosQuery.isLoading ||
    seguradosQuery.isLoading ||
    apolicesQuery.isLoading;

  const isError = sinistrosQuery.isError;

  const refetch = () => {
    resumoQuery.refetch();
    sinistrosQuery.refetch();
    seguradosQuery.refetch();
    apolicesQuery.refetch();
  };

  return {
    resumo: resumoQuery.data,
    todosSinistros,
    contagemPorStatus,
    totalSinistros,
    totalEmAnalise,
    valorTotalLiquidado,
    tempoMedioDias,
    variacaoMesAnterior,
    filaTrabalho,
    ultimoSinistro,
    isLoading,
    isError,
    refetch,
  };
}
