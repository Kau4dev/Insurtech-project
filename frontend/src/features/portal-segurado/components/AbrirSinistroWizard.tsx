import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, FormErrorBanner, Input, Select } from "../../../components/ui";
import { useMinhasApolices } from "../hooks/useMinhasApolices";
import { sinistrosApi } from "../../../api/sinistrosApi";
import { sincronizarNotificacoes } from "../../../hooks/useNotificacoes";
import type { TipoSinistro } from "../../../interfaces/enums";
import type { SinistroRequest } from "../../../interfaces/sinistros/sinistroRequest";
import { formatarData, formatarMoeda } from "../../../utils/formatters";
import { extrairMensagemErro } from "../../../utils/errorUtils";
import { formatarTipoSinistro } from "../../../utils/enumUtils";

const TIPOS_SINISTRO: { value: TipoSinistro; label: string }[] = [
  { value: "COLISAO", label: "Colisão" },
  { value: "ROUBO_FURTO", label: "Roubo / Furto" },
  { value: "INCENDIO", label: "Incêndio" },
  { value: "DANO_A_TERCEIRO", label: "Dano a Terceiros" },
  { value: "ALAGAMENTO", label: "Alagamento" },
  { value: "QUEBRA_DE_VIDRO", label: "Quebra de Vidro" },
  { value: "OUTROS", label: "Outros" },
];

interface AbrirSinistroWizardProps {
  seguradoId: string;
  apoliceInicialId?: string;
  onSuccess: (sinistroId: string) => void;
  onCancel: () => void;
}

export const AbrirSinistroWizard: React.FC<AbrirSinistroWizardProps> = ({
  seguradoId,
  apoliceInicialId,
  onSuccess,
  onCancel,
}) => {
  const queryClient = useQueryClient();
  const [etapa, setEtapa] = useState<1 | 2 | 3>(1);
  const [apoliceIdSelecionada, setApoliceIdSelecionada] = useState<string>(
    apoliceInicialId || ""
  );

  // Formulário do Sinistro
  const [numeroSinistro, setNumeroSinistro] = useState<string>(() => {
    const ano = new Date().getFullYear();
    const aleatorio = Math.floor(100000 + Math.random() * 900000);
    return `SIN-${ano}-${aleatorio}`;
  });
  const [tipoSinistro, setTipoSinistro] = useState<TipoSinistro>("COLISAO");
  const [dataOcorrencia, setDataOcorrencia] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [valorEstimado, setValorEstimado] = useState<string>("");
  const [descricao, setDescricao] = useState<string>("");

  const [erro, setErro] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: apolicesPage, isLoading: loadingApolices } =
    useMinhasApolices(seguradoId);
  const apolices = apolicesPage?.content || [];
  const apolicesAtivas = apolices.filter((a) => a.status === "ATIVA");

  const apoliceSelecionada = apolices.find(
    (a) => a.id === apoliceIdSelecionada
  );

  // Validação da Etapa 2
  const validarEtapa2 = (): boolean => {
    setErro(null);

    if (!numeroSinistro.trim()) {
      setErro("Informe o número do sinistro.");
      return false;
    }

    if (!dataOcorrencia) {
      setErro("Informe a data da ocorrência.");
      return false;
    }

    const hoje = new Date().toISOString().split("T")[0];
    if (dataOcorrencia > hoje) {
      setErro("A data da ocorrência não pode ser futura.");
      return false;
    }

    if (apoliceSelecionada?.dataInicioVigencia) {
      const inicio = apoliceSelecionada.dataInicioVigencia.split("T")[0];
      if (dataOcorrencia < inicio) {
        setErro(
          `A data da ocorrência não pode ser anterior ao início da vigência da apólice (${formatarData(
            apoliceSelecionada.dataInicioVigencia
          )}).`
        );
        return false;
      }
    }

    if (apoliceSelecionada?.dataFimVigencia) {
      const fim = apoliceSelecionada.dataFimVigencia.split("T")[0];
      if (dataOcorrencia > fim) {
        setErro(
          `A data da ocorrência não pode ser posterior ao término da vigência da apólice (${formatarData(
            apoliceSelecionada.dataFimVigencia
          )}).`
        );
        return false;
      }
    }

    const valorNum = parseFloat(valorEstimado);
    if (isNaN(valorNum) || valorNum <= 0) {
      setErro("Informe um valor estimado válido maior que zero.");
      return false;
    }

    if (!descricao.trim() || descricao.trim().length < 5) {
      setErro("Descreva detalhadamente o ocorrido (mínimo de 5 caracteres).");
      return false;
    }

    return true;
  };

  const handleAvancarEtapa1 = () => {
    if (!apoliceIdSelecionada) {
      setErro("Selecione uma apólice ativa para continuar.");
      return;
    }
    setErro(null);
    setEtapa(2);
  };

  const handleAvancarEtapa2 = () => {
    if (validarEtapa2()) {
      setEtapa(3);
    }
  };

  const handleSubmitFinal = async () => {
    setErro(null);
    setIsSubmitting(true);

    const payload: SinistroRequest = {
      numeroSinistro: numeroSinistro.trim(),
      apoliceId: apoliceIdSelecionada,
      seguradoId: seguradoId,
      tipoSinistro: tipoSinistro,
      descricao: descricao.trim(),
      dataOcorrencia: dataOcorrencia,
      valorEstimado: parseFloat(valorEstimado),
    };

    try {
      const novoSinistro = await sinistrosApi.cadastrar(payload);
      queryClient.invalidateQueries({ queryKey: ["sinistros"] });
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
      sincronizarNotificacoes();
      if (novoSinistro.id) {
        onSuccess(novoSinistro.id);
      }
    } catch (err) {
      setErro(
        extrairMensagemErro(
          err,
          "Não foi possível registrar o sinistro. Verifique as informações fornecidas."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Indicador de Etapas com Linha Conectora */}
      <div className="relative border-b border-(--border) pb-5">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: "Selecionar Apólice" },
            { num: 2, label: "Detalhes do Fato" },
            { num: 3, label: "Revisão e Envio" },
          ].map((item) => {
            const isAtual = etapa === item.num;
            const isConcluida = etapa > item.num;

            return (
              <div
                key={item.num}
                className="flex items-center gap-2.5 z-10 bg-(--surface) pr-2"
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs ${
                    isAtual
                      ? "bg-(--accent) text-white ring-4 ring-(--accent-soft)"
                      : isConcluida
                      ? "bg-emerald-600 text-white"
                      : "bg-(--surface-2) text-(--muted) border border-(--border)"
                  }`}
                >
                  {isConcluida ? "✓" : item.num}
                </span>
                <span
                  className={`text-xs font-semibold hidden sm:inline ${
                    isAtual
                      ? "text-(--accent-ink)"
                      : isConcluida
                      ? "text-(--fg)"
                      : "text-(--muted)"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <FormErrorBanner message={erro} />

      {/* ETAPA 1: Seleção de Apólice */}
      {etapa === 1 && (
        <div className="space-y-5">
          <div>
            <h3 className="font-bold text-base text-(--fg) tracking-tight">
              Selecione a Apólice Contratada
            </h3>
            <p className="text-xs text-(--muted) mt-0.5">
              Escolha a apólice referente ao bem ou cobertura afetada. Apenas
              apólices ativas podem ser acionadas.
            </p>
          </div>

          {loadingApolices ? (
            <div className="py-12 text-center text-xs text-(--muted)">
              Carregando suas apólices...
            </div>
          ) : apolicesAtivas.length === 0 ? (
            <div className="p-6 rounded-(--radius) bg-amber-500/5 border border-amber-500/20 text-center space-y-2">
              <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center mx-auto">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-sm font-semibold text-(--fg)">
                Você não possui apólices ativas disponíveis para abertura de
                sinistro.
              </p>
              <p className="text-xs text-(--muted) max-w-md mx-auto">
                Caso possua apólices suspensas ou pendentes, entre em contato
                com a equipe de suporte da seguradora.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {apolicesAtivas.map((apolice) => {
                const selecionada = apolice.id === apoliceIdSelecionada;
                return (
                  <div
                    key={apolice.id}
                    onClick={() => setApoliceIdSelecionada(apolice.id || "")}
                    className={`p-4 rounded-(--radius) border cursor-pointer transition-all flex flex-col justify-between ${
                      selecionada
                        ? "border-(--accent) bg-(--accent-soft)/30 shadow-xs ring-1 ring-(--accent)"
                        : "border-(--border) bg-(--surface) hover:border-(--border-strong) hover:bg-(--surface-2)/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-(--muted) font-medium">
                          #{apolice.numeroApolice}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10.5px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                            {apolice.status}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              selecionada
                                ? "border-(--accent) bg-(--accent) text-white"
                                : "border-(--border)"
                            }`}
                          >
                            {selecionada && (
                              <svg
                                className="w-2.5 h-2.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-(--fg)">
                        {apolice.tipoSeguro}
                      </h4>
                      <p className="text-[11px] text-(--muted) mt-0.5">
                        Vigência: {formatarData(apolice.dataInicioVigencia)} até{" "}
                        {formatarData(apolice.dataFimVigencia)}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-(--border) flex justify-between text-xs">
                      <span className="text-(--muted)">Limite Cobertura:</span>
                      <span className="font-semibold text-(--accent-ink) font-mono num">
                        {formatarMoeda(apolice.valorSeguro)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-(--border)">
            <Button
              variant="secondary"
              onClick={onCancel}
              className="h-10 text-xs justify-center"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              disabled={!apoliceIdSelecionada || apolicesAtivas.length === 0}
              onClick={handleAvancarEtapa1}
              className="h-10 text-xs font-semibold justify-center shadow-2xs"
            >
              Avançar para Detalhes →
            </Button>
          </div>
        </div>
      )}

      {/* ETAPA 2: Detalhes do Ocorrido */}
      {etapa === 2 && (
        <div className="space-y-5">
          <div>
            <h3 className="font-bold text-base text-(--fg) tracking-tight">
              Dados do Evento / Sinistro
            </h3>
            <p className="text-xs text-(--muted) mt-0.5">
              Informe a data em que ocorreu o fato e uma estimativa inicial dos
              danos para a equipe de regulação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Número de Identificação do Sinistro *"
              value={numeroSinistro}
              onChange={(e) => setNumeroSinistro(e.target.value)}
              placeholder="Ex: SIN-2026-102938"
              helperText="Código identificador gerado pelo sistema."
              required
            />

            <Select
              label="Tipo de Sinistro *"
              value={tipoSinistro}
              onChange={(e) => setTipoSinistro(e.target.value as TipoSinistro)}
              options={TIPOS_SINISTRO}
              required
            />

            <Input
              label="Data da Ocorrência *"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              value={dataOcorrencia}
              onChange={(e) => setDataOcorrencia(e.target.value)}
              required
            />

            <Input
              label="Valor Estimado do Prejuízo (R$) *"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              placeholder="Ex: 2500.00"
              value={valorEstimado}
              onChange={(e) => setValorEstimado(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-(--fg) mb-1.5">
              Descrição do Ocorrido *
            </label>
            <textarea
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva detalhadamente o evento, local, terceiros envolvidos e danos aparentes..."
              className="w-full px-3.5 py-2.5 text-sm bg-(--surface) border border-(--border-strong) rounded-lg outline-none focus:ring-2 focus:ring-(--accent-soft) focus:border-(--accent) transition-all text-(--fg)"
              required
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-(--border)">
            <Button
              variant="secondary"
              onClick={() => setEtapa(1)}
              className="h-10 text-xs justify-center"
            >
              ← Voltar
            </Button>
            <Button
              variant="primary"
              onClick={handleAvancarEtapa2}
              className="h-10 text-xs font-semibold justify-center shadow-2xs"
            >
              Revisar Solicitação →
            </Button>
          </div>
        </div>
      )}

      {/* ETAPA 3: Revisão e Envio */}
      {etapa === 3 && (
        <div className="space-y-5">
          <div>
            <h3 className="font-bold text-base text-(--fg) tracking-tight">
              Revisão e Confirmação da Solicitação
            </h3>
            <p className="text-xs text-(--muted) mt-0.5">
              Confira os dados antes de submeter o registro. Após a abertura, um
              analista técnico será designado.
            </p>
          </div>

          <div className="space-y-3.5">
            {/* Resumo da Apólice */}
            <div className="p-4 rounded-(--radius) bg-(--surface-2)/40 border border-(--border) space-y-2">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-(--muted)">
                Apólice Vinculada
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-(--fg)">
                    {apoliceSelecionada?.tipoSeguro} · #
                    {apoliceSelecionada?.numeroApolice}
                  </h4>
                  <p className="text-xs text-(--muted) mt-0.5">
                    Vigência:{" "}
                    {formatarData(apoliceSelecionada?.dataInicioVigencia)} até{" "}
                    {formatarData(apoliceSelecionada?.dataFimVigencia)}
                  </p>
                </div>
                <div className="sm:text-right">
                  <span className="text-xs text-(--muted)">
                    Limite Cobertura
                  </span>
                  <p className="font-bold text-sm text-(--accent-ink) font-mono num">
                    {formatarMoeda(apoliceSelecionada?.valorSeguro)}
                  </p>
                </div>
              </div>
            </div>

            {/* Resumo do Sinistro */}
            <div className="p-4 rounded-(--radius) bg-(--surface) border border-(--border) space-y-3">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-(--muted)">
                Dados do Sinistro
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-(--muted)">Número:</span>
                  <p className="font-mono font-semibold text-(--fg)">
                    {numeroSinistro}
                  </p>
                </div>
                <div>
                  <span className="text-(--muted)">Tipo:</span>
                  <p className="font-semibold text-(--fg)">
                    {formatarTipoSinistro(tipoSinistro)}
                  </p>
                </div>
                <div>
                  <span className="text-(--muted)">Data do Fato:</span>
                  <p className="font-semibold text-(--fg) font-mono">
                    {formatarData(dataOcorrencia)}
                  </p>
                </div>
                <div>
                  <span className="text-(--muted)">Prejuízo Estimado:</span>
                  <p className="font-semibold text-(--accent-ink) font-mono num">
                    {formatarMoeda(parseFloat(valorEstimado))}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-(--border)">
                <span className="text-xs text-(--muted)">
                  Descrição do Ocorrido:
                </span>
                <p className="text-xs text-(--fg) mt-1 p-2.5 rounded-lg bg-(--surface-2) whitespace-pre-wrap leading-relaxed">
                  {descricao}
                </p>
              </div>
            </div>

            {/* Aviso Informativo Institucional */}
            <div className="p-3.5 rounded-lg bg-(--accent-soft)/50 border border-(--accent)/30 text-xs text-(--accent-ink) flex items-center gap-2.5">
              <svg
                className="w-4 h-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                Ao confirmar, o sinistro será criado com o status inicial{" "}
                <strong>REGISTRADO</strong> e entrará na fila de regulação para
                triagem técnica.
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-(--border)">
            <Button
              variant="secondary"
              onClick={() => setEtapa(2)}
              disabled={isSubmitting}
              className="h-10 text-xs justify-center"
            >
              ← Alterar Dados
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitFinal}
              isLoading={isSubmitting}
              className="h-10 text-xs font-semibold justify-center shadow-2xs"
            >
              {isSubmitting
                ? "Registrando Sinistro..."
                : "Confirmar e Abrir Sinistro"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
