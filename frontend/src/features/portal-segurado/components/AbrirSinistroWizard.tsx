import React, { useState } from "react";
import { Button, FormErrorBanner, Input, Select } from "../../../components/ui";
import { useMinhasApolices } from "../hooks/useMinhasApolices";
import { sinistrosApi } from "../../../api/sinistrosApi";
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

  const apoliceSelecionada = apolices.find((a) => a.id === apoliceIdSelecionada);

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
      {/* Indicador de Etapas */}
      <div className="flex items-center justify-between border-b border-(--border) pb-4">
        {[
          { num: 1, label: "1. Selecionar Apólice" },
          { num: 2, label: "2. Detalhes do Ocorrido" },
          { num: 3, label: "3. Revisão e Envio" },
        ].map((item) => (
          <div
            key={item.num}
            className={`flex items-center gap-2 ${
              etapa === item.num
                ? "text-(--accent) font-bold"
                : etapa > item.num
                ? "text-emerald-600 font-medium"
                : "text-(--muted)"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                etapa === item.num
                  ? "bg-(--accent) text-white"
                  : etapa > item.num
                  ? "bg-emerald-500 text-white"
                  : "bg-(--surface-2) text-(--muted)"
              }`}
            >
              {etapa > item.num ? "✓" : item.num}
            </span>
            <span className="text-xs sm:text-sm hidden sm:inline">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <FormErrorBanner message={erro} />

      {/* ETAPA 1: Seleção de Apólice */}
      {etapa === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-base text-(--fg)">
              Selecione a Apólice Contratada
            </h3>
            <p className="text-xs text-(--muted) mt-0.5">
              Escolha a apólice referente ao bem ou cobertura afetada. Apenas apólices ativas podem ser acionadas.
            </p>
          </div>

          {loadingApolices ? (
            <div className="p-8 text-center text-sm text-(--muted)">
              Carregando suas apólices...
            </div>
          ) : apolicesAtivas.length === 0 ? (
            <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
              <span className="text-2xl">⚠️</span>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Você não possui apólices ativas disponíveis para abertura de sinistro.
              </p>
              <p className="text-xs text-(--muted)">
                Caso possua apólices suspensas ou pendentes, entre em contato com a seguradora.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apolicesAtivas.map((apolice) => {
                const selecionada = apolice.id === apoliceIdSelecionada;
                return (
                  <div
                    key={apolice.id}
                    onClick={() => setApoliceIdSelecionada(apolice.id || "")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selecionada
                        ? "border-(--accent) bg-(--accent-soft)/30 ring-2 ring-(--accent)/30"
                        : "border-(--border) bg-(--surface) hover:border-(--border-strong)"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-(--muted)">
                        #{apolice.numeroApolice}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {apolice.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-(--fg)">
                      {apolice.tipoSeguro}
                    </h4>
                    <p className="text-xs text-(--muted) mt-1">
                      Vigência: {formatarData(apolice.dataInicioVigencia)} até{" "}
                      {formatarData(apolice.dataFimVigencia)}
                    </p>
                    <div className="mt-3 pt-2 border-t border-(--border) flex justify-between text-xs">
                      <span className="text-(--muted)">Cobertura:</span>
                      <span className="font-semibold text-(--fg)">
                        {formatarMoeda(apolice.valorSeguro)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-(--border)">
            <Button variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              disabled={!apoliceIdSelecionada || apolicesAtivas.length === 0}
              onClick={handleAvancarEtapa1}
            >
              Avançar para Detalhes →
            </Button>
          </div>
        </div>
      )}

      {/* ETAPA 2: Detalhes do Ocorrido */}
      {etapa === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-base text-(--fg)">
              Dados do Evento / Sinistro
            </h3>
            <p className="text-xs text-(--muted) mt-0.5">
              Informe a data em que ocorreu o fato e uma estimativa inicial dos danos para a equipe de regulação.
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
              step="0.01"
              min="0.01"
              placeholder="Ex: 2500.00"
              value={valorEstimado}
              onChange={(e) => setValorEstimado(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-(--fg) mb-1">
              Descrição do Ocorrido *
            </label>
            <textarea
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva detalhadamente o evento, local, terceiros envolvidos e danos aparentes..."
              className="w-full px-3 py-2 text-sm bg-(--surface) border border-(--border) rounded-lg outline-none focus:border-(--accent) transition-colors"
              required
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-(--border)">
            <Button variant="secondary" onClick={() => setEtapa(1)}>
              ← Voltar
            </Button>
            <Button variant="primary" onClick={handleAvancarEtapa2}>
              Revisar Solicitação →
            </Button>
          </div>
        </div>
      )}

      {/* ETAPA 3: Revisão e Envio */}
      {etapa === 3 && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-base text-(--fg)">
              Revisão e Confirmação da Solicitação
            </h3>
            <p className="text-xs text-(--muted) mt-0.5">
              Confira os dados antes de submeter o registro. Após a abertura, um analista será designado.
            </p>
          </div>

          <div className="space-y-3">
            {/* Resumo da Apólice */}
            <div className="p-4 rounded-xl bg-(--surface) border border-(--border) space-y-2">
              <span className="text-xs font-mono uppercase text-(--muted)">
                Apólice Vinculada
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-(--fg)">
                    {apoliceSelecionada?.tipoSeguro} · #{apoliceSelecionada?.numeroApolice}
                  </h4>
                  <p className="text-xs text-(--muted) mt-0.5">
                    Vigência: {formatarData(apoliceSelecionada?.dataInicioVigencia)} até{" "}
                    {formatarData(apoliceSelecionada?.dataFimVigencia)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-(--muted)">Limite Cobertura</span>
                  <p className="font-bold text-sm text-(--fg)">
                    {formatarMoeda(apoliceSelecionada?.valorSeguro)}
                  </p>
                </div>
              </div>
            </div>

            {/* Resumo do Sinistro */}
            <div className="p-4 rounded-xl bg-(--surface) border border-(--border) space-y-3">
              <span className="text-xs font-mono uppercase text-(--muted)">
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
                  <p className="font-semibold text-(--fg)">
                    {formatarData(dataOcorrencia)}
                  </p>
                </div>
                <div>
                  <span className="text-(--muted)">Prejuízo Estimado:</span>
                  <p className="font-semibold text-emerald-600 font-mono">
                    {formatarMoeda(parseFloat(valorEstimado))}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-(--border)">
                <span className="text-xs text-(--muted)">Descrição do Ocorrido:</span>
                <p className="text-xs text-(--fg) mt-1 p-2.5 rounded bg-(--surface-2) whitespace-pre-wrap">
                  {descricao}
                </p>
              </div>
            </div>

            {/* Aviso Informativo */}
            <div className="p-3 rounded-lg bg-(--accent-soft)/40 border border-(--accent)/30 text-xs text-(--accent-ink) flex items-center gap-2">
              <span>ℹ️</span>
              <span>
                Ao confirmar, o sinistro será criado com o status inicial <strong>REGISTRADO</strong> e entrará na fila de regulação para triagem técnica.
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-(--border)">
            <Button
              variant="secondary"
              onClick={() => setEtapa(2)}
              disabled={isSubmitting}
            >
              ← Alterar Dados
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitFinal}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Registrando Sinistro..." : "✓ Confirmar e Abrir Sinistro"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

