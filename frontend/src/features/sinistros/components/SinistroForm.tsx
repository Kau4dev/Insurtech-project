import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  CopyableId,
  FormActions,
  FormErrorBanner,
  FormSection,
  Input,
  Select,
} from "../../../components/ui";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";
import type { SinistroRequest } from "../../../interfaces/sinistros/sinistroRequest";
import { useApolices } from "../../apolices/hooks/useApolices";
import { SeguradoNome } from "../../segurados/components/SeguradoNome";
import type { SinistroFormData } from "../schemas/sinistroSchema";
import { sinistroSchema } from "../schemas/sinistroSchema";

const TIPOS_SINISTRO = [
  { value: "COLISAO", label: "Colisão" },
  { value: "ROUBO_FURTO", label: "Roubo / Furto" },
  { value: "INCENDIO", label: "Incêndio" },
  { value: "DANO_A_TERCEIRO", label: "Dano a Terceiros" },
  { value: "ALAGAMENTO", label: "Alagamento" },
  { value: "QUEBRA_DE_VIDRO", label: "Quebra de Vidro" },
  { value: "OUTROS", label: "Outros" },
];

interface SinistroFormProps {
  sinistroInicial?: Sinistro | null;
  apoliceInicialId?: string;
  seguradoInicialId?: string;
  onSubmit: (data: SinistroRequest) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const SinistroForm: React.FC<SinistroFormProps> = ({
  sinistroInicial,
  apoliceInicialId,
  seguradoInicialId,
  onSubmit,
  onCancel,
  isLoading = false,
  errorMessage = null,
}) => {
  const isEdicao = !!sinistroInicial?.id;

  const { data: apolicesData, isLoading: loadingApolices } = useApolices({
    size: 100,
  });
  const apolices = apolicesData?.content || [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SinistroFormData>({
    resolver: zodResolver(sinistroSchema),
    defaultValues: {
      numeroSinistro: "",
      apoliceId: sinistroInicial?.apoliceId || apoliceInicialId || "",
      seguradoId: sinistroInicial?.seguradoId || seguradoInicialId || "",
      tipoSinistro: "COLISAO",
      descricao: "",
      dataOcorrencia: "",
      valorEstimado: "",
    },
  });

  const apoliceIdAtual = watch("apoliceId");
  const seguradoIdAtual = watch("seguradoId");
  const apoliceSelecionada = apolices.find((a) => a.id === apoliceIdAtual);

  useEffect(() => {
    if (sinistroInicial) {
      reset({
        numeroSinistro: sinistroInicial.numeroSinistro,
        apoliceId: sinistroInicial.apoliceId,
        seguradoId: sinistroInicial.seguradoId,
        tipoSinistro: sinistroInicial.tipoSinistro,
        descricao: sinistroInicial.descricao || "",
        dataOcorrencia: sinistroInicial.dataOcorrencia,
        valorEstimado: String(sinistroInicial.valorEstimado ?? ""),
      });
    }
  }, [sinistroInicial, reset]);

  const handleFormSubmit = async (formData: SinistroFormData) => {
    const payload: SinistroRequest = {
      numeroSinistro: formData.numeroSinistro,
      apoliceId: formData.apoliceId,
      seguradoId: formData.seguradoId,
      tipoSinistro: formData.tipoSinistro,
      descricao: formData.descricao,
      dataOcorrencia: formData.dataOcorrencia,
      valorEstimado: Number(formData.valorEstimado),
    };
    await onSubmit(payload);
  };

  const loading = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <FormErrorBanner message={errorMessage} />

      {/* Identificação e Vinculação */}
      <FormSection title="Identificação e Vínculos">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Número do Sinistro *"
            placeholder="Ex: SIN-2026-0001"
            disabled={isEdicao}
            error={errors.numeroSinistro?.message}
            {...register("numeroSinistro")}
          />

          {/* Seletor de Apólice Vinculada */}
          <div>
            <label className="block text-xs font-semibold text-(--fg) uppercase tracking-wider mb-2">
              Apólice Vinculada *
            </label>
            <select
              value={apoliceIdAtual}
              disabled={isEdicao || Boolean(apoliceInicialId && !isEdicao)}
              onChange={(e) => {
                const chosenId = e.target.value;
                setValue("apoliceId", chosenId, { shouldValidate: true });
                const foundApolice = apolices.find((a) => a.id === chosenId);
                if (foundApolice) {
                  setValue("seguradoId", foundApolice.seguradoId, {
                    shouldValidate: true,
                  });
                } else {
                  setValue("seguradoId", "");
                }
              }}
              className={`w-full px-3 py-2 text-sm bg-(--surface) border rounded-lg outline-none transition-colors ${
                errors.apoliceId
                  ? "border-(--danger)"
                  : "border-(--border) focus:border-(--accent)"
              } ${isEdicao || (apoliceInicialId && !isEdicao) ? "bg-(--surface-2) cursor-not-allowed opacity-80" : ""}`}
            >
              <option value="">
                {loadingApolices
                  ? "Carregando apólices..."
                  : "Selecione a Apólice pelo Número"}
              </option>
              {apolices.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.numeroApolice} — {a.tipoSeguro} ({a.status})
                </option>
              ))}
            </select>
            {errors.apoliceId && (
              <span className="text-xs text-(--danger) mt-1 block">
                {errors.apoliceId.message}
              </span>
            )}
            {errors.seguradoId && !errors.apoliceId && (
              <span className="text-xs text-(--danger) mt-1 block">
                {errors.seguradoId.message}
              </span>
            )}
          </div>

          {/* Resumo da Apólice e Segurado Vinculado */}
          {apoliceIdAtual && (
            <div className="md:col-span-2 p-3 rounded-lg bg-(--surface-2)/60 border border-(--border) text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-(--fg)">
                    Apólice:{" "}
                    {apoliceSelecionada?.numeroApolice ||
                      apoliceIdAtual.slice(0, 8) + "..."}
                  </span>
                  {apoliceSelecionada && (
                    <span className="px-1.5 py-0.5 rounded bg-(--surface) text-(--muted) border border-(--border)">
                      {apoliceSelecionada.tipoSeguro}
                    </span>
                  )}
                </div>
                <div className="text-(--muted) flex items-center gap-1.5">
                  <span>Segurado Vinculado:</span>
                  <strong className="text-(--fg)">
                    {seguradoIdAtual ? (
                      <SeguradoNome seguradoId={seguradoIdAtual} />
                    ) : (
                      "—"
                    )}
                  </strong>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CopyableId id={apoliceIdAtual} label="ID Apólice" truncate />
              </div>
            </div>
          )}
        </div>
      </FormSection>

      {/* Dados do Evento */}
      <FormSection title="Dados da Ocorrência">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Tipo do Sinistro *"
            options={TIPOS_SINISTRO}
            error={errors.tipoSinistro?.message}
            {...register("tipoSinistro")}
          />

          <Input
            label="Data da Ocorrência *"
            type="date"
            error={errors.dataOcorrencia?.message}
            {...register("dataOcorrencia")}
          />

          <Input
            label="Valor Estimado do Prejuízo (R$) *"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            error={errors.valorEstimado?.message}
            {...register("valorEstimado")}
          />
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-(--muted) uppercase tracking-wider mb-1">
            Descrição do Sinistro *
          </label>
          <textarea
            rows={4}
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-(--surface) text-(--fg) focus:outline-none focus:border-(--accent) ${
              errors.descricao ? "border-rose-400" : "border-(--border-strong)"
            }`}
            placeholder="Descreva detalhadamente a dinâmica do sinistro, circunstâncias e danos aparentes..."
            {...register("descricao")}
          />
          {errors.descricao && (
            <p className="mt-1 text-xs text-rose-500">
              {errors.descricao.message}
            </p>
          )}
        </div>
      </FormSection>

      {/* Ações */}
      <FormActions
        onCancel={onCancel}
        isLoading={loading}
        submitText={isEdicao ? "Atualizar Sinistro" : "Registrar Sinistro"}
      />
    </form>
  );
};
