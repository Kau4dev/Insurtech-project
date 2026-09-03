import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  FormActions,
  FormErrorBanner,
  FormSection,
  Input,
  RadioGroup,
  Select,
} from "../../../components/ui";
import { UFS } from "../../../interfaces/enums";
import type { Segurado } from "../../../interfaces/segurados/segurado";
import type {
  SeguradoRequest,
  SeguradoUpdateRequest,
} from "../../../interfaces/segurados/seguradoRequest";
import {
  apenasNumeros,
  formatarCep,
  formatarCpfCnpj,
  formatarTelefone,
} from "../../../utils/formatters";
import {
  seguradoSchema,
  type SeguradoFormData,
} from "../schemas/seguradoSchema";

interface SeguradoFormProps {
  seguradoInicial?: Segurado | null;
  onSubmit: (
    data: SeguradoRequest | SeguradoUpdateRequest,
  ) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const SeguradoForm: React.FC<SeguradoFormProps> = ({
  seguradoInicial,
  onSubmit,
  onCancel,
  isLoading = false,
  errorMessage = null,
}) => {
  const isEdicao = !!seguradoInicial?.id;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SeguradoFormData>({
    resolver: zodResolver(seguradoSchema),
    defaultValues: {
      tipoPessoa: "PF",
      nomeRazaoSocial: "",
      cpfCnpj: "",
      email: "",
      telefone: "",
      dataNascimento: "",
      enderecoLogradouro: "",
      enderecoCidade: "",
      enderecoUf: "",
      enderecoCep: "",
    },
  });

  const tipoPessoa = watch("tipoPessoa");

  useEffect(() => {
    if (seguradoInicial) {
      reset({
        tipoPessoa: seguradoInicial.tipoPessoa || "PF",
        nomeRazaoSocial: seguradoInicial.nomeRazaoSocial || "",
        cpfCnpj: formatarCpfCnpj(
          seguradoInicial.cpfCnpj,
          seguradoInicial.tipoPessoa,
        ),
        email: seguradoInicial.email || "",
        telefone:
          formatarTelefone(seguradoInicial.telefone) === "-"
            ? ""
            : formatarTelefone(seguradoInicial.telefone),
        dataNascimento: seguradoInicial.dataNascimento || "",
        enderecoLogradouro: seguradoInicial.enderecoLogradouro || "",
        enderecoCidade: seguradoInicial.enderecoCidade || "",
        enderecoUf: seguradoInicial.enderecoUf || "",
        enderecoCep:
          formatarCep(seguradoInicial.enderecoCep) === "-"
            ? ""
            : formatarCep(seguradoInicial.enderecoCep),
      });
    } else {
      reset({
        tipoPessoa: "PF",
        nomeRazaoSocial: "",
        cpfCnpj: "",
        email: "",
        telefone: "",
        dataNascimento: "",
        enderecoLogradouro: "",
        enderecoCidade: "",
        enderecoUf: "",
        enderecoCep: "",
      });
    }
  }, [seguradoInicial, reset]);

  useEffect(() => {
    if (tipoPessoa === "PJ") {
      setValue("dataNascimento", "");
    }
  }, [tipoPessoa, setValue]);

  const handleFormSubmit = async (data: SeguradoFormData) => {
    if (isEdicao) {
      const updatePayload: SeguradoUpdateRequest = {
        nomeRazaoSocial: data.nomeRazaoSocial,
        email: data.email,
        telefone: data.telefone ? apenasNumeros(data.telefone) : undefined,
        dataNascimento:
          data.tipoPessoa === "PF" && data.dataNascimento
            ? data.dataNascimento
            : undefined,
        enderecoLogradouro: data.enderecoLogradouro || undefined,
        enderecoCidade: data.enderecoCidade || undefined,
        enderecoUf: data.enderecoUf || undefined,
        enderecoCep: data.enderecoCep
          ? apenasNumeros(data.enderecoCep)
          : undefined,
      };
      await onSubmit(updatePayload);
    } else {
      const createPayload: SeguradoRequest = {
        tipoPessoa: data.tipoPessoa as "PF" | "PJ",
        nomeRazaoSocial: data.nomeRazaoSocial,
        cpfCnpj: apenasNumeros(data.cpfCnpj),
        email: data.email,
        telefone: data.telefone ? apenasNumeros(data.telefone) : undefined,
        dataNascimento:
          data.tipoPessoa === "PF" && data.dataNascimento
            ? data.dataNascimento
            : undefined,
        enderecoLogradouro: data.enderecoLogradouro || undefined,
        enderecoCidade: data.enderecoCidade || undefined,
        enderecoUf: data.enderecoUf || undefined,
        enderecoCep: data.enderecoCep
          ? apenasNumeros(data.enderecoCep)
          : undefined,
      };
      await onSubmit(createPayload);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <FormErrorBanner message={errorMessage} />

      <div className="space-y-4">
        {/* Tipo de Pessoa */}
        <RadioGroup
          label="Tipo de Pessoa *"
          disabled={isEdicao}
          error={errors.tipoPessoa?.message}
          options={[
            { value: "PF", label: "Pessoa Física (PF)" },
            { value: "PJ", label: "Pessoa Jurídica (PJ)" },
          ]}
          {...register("tipoPessoa")}
        />

        {/* Nome / Razão Social & CPF / CNPJ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={tipoPessoa === "PF" ? "Nome Completo *" : "Razão Social *"}
            placeholder={
              tipoPessoa === "PF"
                ? "Ex: João da Silva"
                : "Ex: Minha Empresa LTDA"
            }
            error={errors.nomeRazaoSocial?.message}
            {...register("nomeRazaoSocial")}
          />

          <Input
            label={tipoPessoa === "PF" ? "CPF *" : "CNPJ *"}
            placeholder={
              tipoPessoa === "PF" ? "000.000.000-00" : "00.000.000/0000-00"
            }
            disabled={isEdicao}
            error={errors.cpfCnpj?.message}
            {...register("cpfCnpj")}
          />
        </div>

        {/* Email, Telefone & Data Nascimento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="E-mail *"
            type="email"
            placeholder="exemplo@email.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Telefone"
            placeholder="(11) 99999-8888"
            error={errors.telefone?.message}
            {...register("telefone")}
          />

          {tipoPessoa === "PF" && (
            <Input
              label="Data de Nascimento *"
              type="date"
              error={errors.dataNascimento?.message}
              {...register("dataNascimento")}
            />
          )}
        </div>

        {/* Endereço */}
        <FormSection title="Endereço (Opcional)">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Logradouro"
                placeholder="Rua, Av, Número, Complemento"
                error={errors.enderecoLogradouro?.message}
                {...register("enderecoLogradouro")}
              />
            </div>

            <Input
              label="Cidade"
              placeholder="São Paulo"
              error={errors.enderecoCidade?.message}
              {...register("enderecoCidade")}
            />

            <div className="grid grid-cols-2 gap-2">
              <Select
                label="UF"
                options={UFS}
                error={errors.enderecoUf?.message}
                {...register("enderecoUf")}
              />

              <Input
                label="CEP"
                placeholder="00000-000"
                error={errors.enderecoCep?.message}
                {...register("enderecoCep")}
              />
            </div>
          </div>
        </FormSection>
      </div>

      <FormActions
        onCancel={onCancel}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        isEdicao={isEdicao}
        submitText={isEdicao ? "Salvar Alterações" : "Cadastrar Segurado"}
      />
    </form>
  );
};
