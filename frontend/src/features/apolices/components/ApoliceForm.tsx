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
import type { Apolice } from "../../../interfaces/apolices/apolice";
import type {
  ApoliceRequest,
  ApoliceUpdateRequest,
} from "../../../interfaces/apolices/apoliceRequest";
import { formatarCpfCnpj } from "../../../utils/formatters";
import { useSegurados } from "../../segurados/hooks/useSegurados";
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
  seguradoInicialId?: string;
  onSubmit: (
    data: ApoliceRequest | ApoliceUpdateRequest,
  ) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const ApoliceForm: React.FC<ApoliceFormProps> = ({
  apoliceInicial,
  seguradoInicialId,
  onSubmit,
  onCancel,
  isLoading = false,
  errorMessage = null,
}) => {
  const isEdicao = !!apoliceInicial?.id;

  const { data: seguradosData, isLoading: loadingSegurados } = useSegurados({
    size: 100,
  });
  const segurados = seguradosData?.content || [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ApoliceFormData>({
    resolver: zodResolver(apoliceSchema),
    defaultValues: {
      seguradoId: apoliceInicial?.seguradoId || seguradoInicialId || "",
      numeroApolice: "",
      tipoSeguro: "AUTO",
      valorSeguro: "",
      valorPremio: "",
      dataInicioVigencia: "",
      dataFimVigencia: "",
      coberturas: [],
    },
  });

  const seguradoIdAtual = watch("seguradoId");
  const seguradoSelecionado = segurados.find((s) => s.id === seguradoIdAtual);

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
            {/* Seletor de Segurado */}
            <div>
              <label className="block text-xs font-semibold text-(--fg) uppercase tracking-wider mb-2">
                Segurado *
              </label>
              <select
                value={seguradoIdAtual}
                disabled={isEdicao || Boolean(seguradoInicialId && !isEdicao)}
                onChange={(e) =>
                  setValue("seguradoId", e.target.value, {
                    shouldValidate: true,
                  })
                }
                className={`w-full px-3 py-2 text-sm bg-(--surface) border rounded-lg outline-none transition-colors ${
                  errors.seguradoId
                    ? "border-(--danger)"
                    : "border-(--border) focus:border-(--accent)"
                } ${isEdicao || (seguradoInicialId && !isEdicao) ? "bg-(--surface-2) cursor-not-allowed opacity-80" : ""}`}
              >
                <option value="">
                  {loadingSegurados
                    ? "Carregando segurados..."
                    : "Selecione o Segurado (Nome ou CPF/CNPJ)"}
                </option>
                {segurados.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nomeRazaoSocial} —{" "}
                    {s.tipoPessoa === "PF" ? "CPF: " : "CNPJ: "}
                    {formatarCpfCnpj(s.cpfCnpj, s.tipoPessoa)}
                  </option>
                ))}
              </select>
              {errors.seguradoId && (
                <span className="text-xs text-(--danger) mt-1 block">
                  {errors.seguradoId.message}
                </span>
              )}

              {seguradoSelecionado && (
                <div className="mt-2 p-2.5 rounded-lg bg-(--surface-2)/60 border border-(--border) text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-(--fg)">
                      {seguradoSelecionado.nomeRazaoSocial}
                    </span>
                    <span className="text-(--muted)">•</span>
                    <span className="mono text-(--muted)">
                      {formatarCpfCnpj(
                        seguradoSelecionado.cpfCnpj,
                        seguradoSelecionado.tipoPessoa,
                      )}
                    </span>
                  </div>
                  <CopyableId id={seguradoSelecionado.id} truncate />
                </div>
              )}
            </div>

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
