import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  FormActions,
  FormErrorBanner,
  FormSection,
  Input,
  Select,
} from "../../../components/ui";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";
import type { SinistroRequest } from "../../../interfaces/sinistros/sinistroRequest";
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
  onSubmit: (data: SinistroRequest) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const SinistroForm: React.FC<SinistroFormProps> = ({
  sinistroInicial,
  onSubmit,
  onCancel,
  isLoading = false,
  errorMessage = null,
}) => {
  const isEdicao = !!sinistroInicial?.id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SinistroFormData>({
    resolver: zodResolver(sinistroSchema),
    defaultValues: {
      numeroSinistro: "",
      apoliceId: "",
      seguradoId: "",
      tipoSinistro: "COLISAO",
      descricao: "",
      dataOcorrencia: "",
      valorEstimado: "",
    },
  });

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Número do Sinistro *"
            placeholder="Ex: SIN-2026-0001"
            disabled={isEdicao}
            error={errors.numeroSinistro?.message}
            {...register("numeroSinistro")}
          />

          <Input
            label="ID da Apólice (UUID) *"
            placeholder="UUID da apólice ativa"
            disabled={isEdicao}
            error={errors.apoliceId?.message}
            {...register("apoliceId")}
          />

          <Input
            label="ID do Segurado (UUID) *"
            placeholder="UUID do segurado"
            disabled={isEdicao}
            error={errors.seguradoId?.message}
            {...register("seguradoId")}
          />
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
