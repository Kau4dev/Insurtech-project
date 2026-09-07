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
import type { Apolice } from "../../../interfaces/apolices/apolice";
import type {
  ApoliceRequest,
  ApoliceUpdateRequest,
} from "../../../interfaces/apolices/apoliceRequest";
import type { ApoliceFormData } from "../schemas/apoliceSchema";
import { apoliceSchema } from "../schemas/apoliceSchema";
import { CoberturaList } from "./CoberturaList";

const TIPOS_SEGURO = [
  { value: "AUTO", label: "Automóvel" },
  { value: "RESIDENCIAL", label: "Residencial" },
  { value: "VIDA", label: "Vida" },
  { value: "PATRIMONIAL", label: "Patrimonial" },
  { value: "EMPRESARIAL", label: "Empresarial" },
];

interface ApoliceFormProps {
  apoliceInicial?: Apolice | null;
  onSubmit: (
    data: ApoliceRequest | ApoliceUpdateRequest,
  ) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const ApoliceForm: React.FC<ApoliceFormProps> = ({
  apoliceInicial,
  onSubmit,
  onCancel,
  isLoading = false,
  errorMessage = null,
}) => {
  const isEdicao = !!apoliceInicial?.id;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApoliceFormData>({
    resolver: zodResolver(apoliceSchema),
    defaultValues: {
      seguradoId: "",
      numeroApolice: "",
      tipoSeguro: "AUTO",
      valorSeguro: "",
      valorPremio: "",
      dataInicioVigencia: "",
      dataFimVigencia: "",
      coberturas: [],
    },
  });

  useEffect(() => {
    if (apoliceInicial) {
      reset({
        seguradoId: apoliceInicial.seguradoId,
        numeroApolice: apoliceInicial.numeroApolice,
        tipoSeguro: apoliceInicial.tipoSeguro,
        valorSeguro: String(apoliceInicial.valorSeguro ?? ""),
        valorPremio: String(apoliceInicial.valorPremio ?? ""),
        dataInicioVigencia: apoliceInicial.dataInicioVigencia,
        dataFimVigencia: apoliceInicial.dataFimVigencia,
        coberturas:
          apoliceInicial.coberturas?.map((c) => ({
            tipoCobertura: c.tipoCobertura,
            valorCobertura: String(c.valorCobertura ?? ""),
            valorFranquia: c.valorFranquia
              ? String(c.valorFranquia)
              : undefined,
          })) ?? [],
      });
    } else {
      reset({
        seguradoId: "",
        numeroApolice: "",
        tipoSeguro: "AUTO",
        valorSeguro: "",
        valorPremio: "",
        dataInicioVigencia: "",
        dataFimVigencia: "",
        coberturas: [],
      });
    }
  }, [apoliceInicial, reset]);

  const handleFormSubmit = async (data: ApoliceFormData) => {
    const coberturasFormatadas =
      data.coberturas?.map((c) => ({
        tipoCobertura: c.tipoCobertura,
        valorCobertura: Number(c.valorCobertura),
        valorFranquia: c.valorFranquia ? Number(c.valorFranquia) : 0,
      })) ?? [];

    if (isEdicao) {
      const updatePayload: ApoliceUpdateRequest = {
        tipoSeguro: data.tipoSeguro,
        valorSeguro: Number(data.valorSeguro),
        valorPremio: Number(data.valorPremio),
        dataInicioVigencia: data.dataInicioVigencia,
        dataFimVigencia: data.dataFimVigencia,
        coberturas: coberturasFormatadas,
      };
      await onSubmit(updatePayload);
    } else {
      const createPayload: ApoliceRequest = {
        seguradoId: data.seguradoId,
        numeroApolice: data.numeroApolice,
        tipoSeguro: data.tipoSeguro,
        valorSeguro: Number(data.valorSeguro),
        valorPremio: Number(data.valorPremio),
        dataInicioVigencia: data.dataInicioVigencia,
        dataFimVigencia: data.dataFimVigencia,
        coberturas: coberturasFormatadas,
      };
      await onSubmit(createPayload);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <FormErrorBanner message={errorMessage} />

      <div className="space-y-4">
        {/* Identificação da Apólice */}
        <FormSection title="Identificação">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="ID do Segurado *"
              placeholder="UUID do segurado"
              disabled={isEdicao}
              error={errors.seguradoId?.message}
              {...register("seguradoId")}
            />

            <Input
              label="Número da Apólice *"
              placeholder="Ex: AP-2024-001"
              disabled={isEdicao}
              error={errors.numeroApolice?.message}
              {...register("numeroApolice")}
            />
          </div>
        </FormSection>

        {/* Detalhes do Seguro */}
        <FormSection title="Valores e Tipo">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Tipo de Seguro *"
              options={TIPOS_SEGURO}
              error={errors.tipoSeguro?.message}
              {...register("tipoSeguro")}
            />

            <Input
              label="Valor do Seguro (R$) *"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.valorSeguro?.message}
              {...register("valorSeguro")}
            />

            <Input
              label="Valor do Prêmio (R$) *"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.valorPremio?.message}
              {...register("valorPremio")}
            />
          </div>
        </FormSection>

        {/* Vigência */}
        <FormSection title="Vigência">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Início da Vigência *"
              type="date"
              error={errors.dataInicioVigencia?.message}
              {...register("dataInicioVigencia")}
            />

            <Input
              label="Fim da Vigência *"
              type="date"
              error={errors.dataFimVigencia?.message}
              {...register("dataFimVigencia")}
            />
          </div>
        </FormSection>

        {/* Coberturas Dinâmicas */}
        <FormSection>
          <CoberturaList
            editable
            control={control}
            register={register}
            errors={errors}
          />
        </FormSection>
      </div>

      <FormActions
        onCancel={onCancel}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        isEdicao={isEdicao}
      />
    </form>
  );
};
