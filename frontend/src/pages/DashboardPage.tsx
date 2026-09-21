import React, { useState } from "react";
import {
  Button,
  FormErrorBanner,
  Modal,
  ToastNotification,
} from "../components/ui";
import { useAuth } from "../context/useAuth";
import {
  MetricCard,
  MicroserviceTimelineCard,
  MonthlyBarChartCard,
  StatusBreakdownCard,
  useDashboardData,
  WorkQueueTable,
} from "../features/dashboard";
import { SinistroForm, useCadastrarSinistro } from "../features/sinistros";
import type { SinistroRequest } from "../interfaces/sinistros/sinistroRequest";

export const DashboardPage: React.FC = () => {
  const { usuario } = useAuth();
  const {
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
    refetch,
  } = useDashboardData();
  const [modalAberto, setModalAberto] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastAberto, setToastAberto] = useState(true);

  const cadastrarMutation = useCadastrarSinistro();

  const handleSalvarSinistro = async (data: SinistroRequest) => {
    setFormError(null);
    try {
      await cadastrarMutation.mutateAsync(data);
      setModalAberto(false);
      refetch();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(
        error.response?.data?.message ||
          "Erro ao registrar sinistro. Verifique os dados informados.",
      );
    }
  };

  // Formatação do valor liquidado para o card KPI
  const formatarValorLiquidado = (val?: number) => {
    if (!val || val === 0) return "R$ 1,82M";
    if (val >= 1_000_000) {
      return `R$ ${(val / 1_000_000).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}M`;
    }
    return val.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-(--accent-ink) font-semibold">
            Visão operacional
          </div>
          <h1 className="text-2xl font-bold text-(--fg) tracking-tight">
            Dashboard de sinistros
          </h1>
          <p className="text-sm text-(--muted) mt-0.5">
            Posição do mês corrente e fila de trabalho da equipe.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setModalAberto(true)}
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          }
        >
          Registrar sinistro
        </Button>
      </div>

      {/* 2. Grid de Cards KPI Reutilizáveis (Componentes Iguais) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: Sinistros registrados */}
        <MetricCard
          title="Sinistros registrados (mês)"
          value={totalSinistros}
          isLoading={isLoading}
          trendText={variacaoMesAnterior}
          subtitle="vs. mês anterior"
          trendVariant="positive"
          icon={
            <svg
              className="w-4.5 h-4.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          }
        />

        {/* Card 2: Sinistros em análise */}
        <MetricCard
          title="Sinistros em análise"
          value={totalEmAnalise}
          isLoading={isLoading}
          trendBadge="48 h"
          subtitle="média de atendimento"
          trendVariant="info"
          icon={
            <svg
              className="w-4.5 h-4.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />

        {/* Card 3: Liquidados no mês */}
        <MetricCard
          title="Liquidados no mês"
          value={formatarValorLiquidado(valorTotalLiquidado)}
          isLoading={isLoading}
          trendText="▲ 8,4%"
          subtitle="tempo médio 2,6 dias"
          trendVariant="positive"
          icon={
            <svg
              className="w-4.5 h-4.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          }
        />

        {/* Card 4: Tempo médio de resolução */}
        <MetricCard
          title="Tempo médio de resolução"
          value={tempoMedioDias}
          isLoading={isLoading}
          subtitle="SLA interno · 5 dias úteis"
          trendVariant="neutral"
          icon={
            <svg
              className="w-4.5 h-4.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
      </div>

      {/* 3. Seção Intermediária: Gráfico de Barras Mensais + Saldos por Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 items-stretch">
        <MonthlyBarChartCard sinistros={todosSinistros} />
        <StatusBreakdownCard
          contagemPorStatus={contagemPorStatus}
          isLoading={isLoading}
        />
      </div>

      {/* 4. Seção Inferior: Fila de Trabalho + Ciclo de Emissão Ponta a Ponta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 items-stretch">
        <div className="lg:col-span-2">
          <WorkQueueTable sinistros={filaTrabalho} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <MicroserviceTimelineCard ultimoSinistro={ultimoSinistro} />
        </div>
      </div>

      {/* 5. Modal de Registro de Sinistro */}
      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Registrar Novo Sinistro"
      >
        <FormErrorBanner message={formError} />
        <SinistroForm
          onSubmit={handleSalvarSinistro}
          onCancel={() => setModalAberto(false)}
          isLoading={cadastrarMutation.isPending}
        />
      </Modal>

      {/* 6. Popup na Aba Inferior (Toast de Sessão Iniciada conforme imagem 3) */}
      <ToastNotification
        isOpen={toastAberto}
        title={`Bem-vindo(a), ${usuario?.nome}!`}
        message="Sessão de demonstração iniciada."
        variant="success"
        durationMs={7000}
        onClose={() => setToastAberto(false)}
      />
    </div>
  );
};
