import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  FormActions,
  FormErrorBanner,
  FormSection,
  Input,
  RadioGroup,
  Select,
} from "../../../components/ui";
import { UFS } from "../../../interfaces/enums";
import {
  apiParaEndereco,
  enderecoParaApi,
} from "../../../interfaces/segurados/enderecoMapper";
import type { Segurado } from "../../../interfaces/segurados/segurado";
import type {
  SeguradoRequest,
  SeguradoUpdateRequest,
} from "../../../interfaces/segurados/seguradoRequest";
import {
  apenasNumeros,
  maskCep,
  maskCpfCnpj,
  maskTelefone,
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
    getValues,
    setValue,
    clearErrors,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SeguradoFormData>({
    resolver: zodResolver(seguradoSchema),
    defaultValues: (() => {
      const end = apiParaEndereco(
        seguradoInicial?.enderecoLogradouro,
        seguradoInicial?.enderecoCidade,
        seguradoInicial?.enderecoUf,
        seguradoInicial?.enderecoCep,
      );
      return {
        usuarioId: seguradoInicial?.usuarioId || "",
        tipoPessoa: seguradoInicial?.tipoPessoa || "PF",
        nomeRazaoSocial: seguradoInicial?.nomeRazaoSocial || "",
        cpfCnpj: seguradoInicial
          ? maskCpfCnpj(seguradoInicial.cpfCnpj, seguradoInicial.tipoPessoa)
          : "",
        email: seguradoInicial?.email || "",
        telefone: seguradoInicial?.telefone
          ? maskTelefone(seguradoInicial.telefone)
          : "",
        dataNascimento: seguradoInicial?.dataNascimento || "",
        enderecoRua: end.rua || "",
        enderecoNumero: end.numero || "",
        enderecoBairro: end.bairro || "",
        enderecoComplemento: end.complemento || "",
        enderecoCidade: end.cidade || "",
        enderecoUf: end.uf || "",
        enderecoCep: end.cep ? maskCep(end.cep) : "",
      };
    })(),
  });

  const tipoPessoa = useWatch({ control, name: "tipoPessoa" }) || "PF";
  const cpfCnpjValue = useWatch({ control, name: "cpfCnpj" }) || "";
  const telefoneValue = useWatch({ control, name: "telefone" }) || "";
  const enderecoCepValue = useWatch({ control, name: "enderecoCep" }) || "";

  // Apenas popula se houver alteração em seguradoInicial (modo edição)
  useEffect(() => {
    if (seguradoInicial) {
      const end = apiParaEndereco(
        seguradoInicial.enderecoLogradouro,
        seguradoInicial.enderecoCidade,
        seguradoInicial.enderecoUf,
        seguradoInicial.enderecoCep,
      );
      reset({
        usuarioId: seguradoInicial.usuarioId || "",
        tipoPessoa: seguradoInicial.tipoPessoa || "PF",
        nomeRazaoSocial: seguradoInicial.nomeRazaoSocial || "",
        cpfCnpj: maskCpfCnpj(
          seguradoInicial.cpfCnpj,
          seguradoInicial.tipoPessoa,
        ),
        email: seguradoInicial.email || "",
        telefone: seguradoInicial.telefone
          ? maskTelefone(seguradoInicial.telefone)
          : "",
        dataNascimento: seguradoInicial.dataNascimento || "",
        enderecoRua: end.rua || "",
        enderecoNumero: end.numero || "",
        enderecoBairro: end.bairro || "",
        enderecoComplemento: end.complemento || "",
        enderecoCidade: end.cidade || "",
        enderecoUf: end.uf || "",
        enderecoCep: end.cep ? maskCep(end.cep) : "",
      });
    }
  }, [seguradoInicial, reset]);

  // Se trocar para PJ, limpa a data de nascimento
  useEffect(() => {
    if (tipoPessoa === "PJ") {
      setValue("dataNascimento", "");
      clearErrors("dataNascimento");
    }
  }, [tipoPessoa, setValue, clearErrors]);

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatado = maskCpfCnpj(raw, tipoPessoa);
    setValue("cpfCnpj", formatado, { shouldValidate: true, shouldDirty: true });
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatado = maskTelefone(raw);
    setValue("telefone", formatado, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatado = maskCep(raw);
    setValue("enderecoCep", formatado, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleFormSubmit = async (data: SeguradoFormData) => {
    const telLimpo = apenasNumeros(data.telefone);
    const cepLimpo = apenasNumeros(data.enderecoCep);

    const enderecoPayload = enderecoParaApi({
      rua: data.enderecoRua,
      numero: data.enderecoNumero,
      bairro: data.enderecoBairro,
      complemento: data.enderecoComplemento,
      cidade: data.enderecoCidade,
      uf: data.enderecoUf,
      cep: cepLimpo.length > 0 ? cepLimpo : undefined,
    });

    if (isEdicao) {
      const updatePayload: SeguradoUpdateRequest = {
        nomeRazaoSocial: data.nomeRazaoSocial.trim(),
        email: data.email.trim(),
        telefone: telLimpo.length > 0 ? telLimpo : undefined,
        dataNascimento:
          data.tipoPessoa === "PF" && data.dataNascimento?.trim()
            ? data.dataNascimento
            : undefined,
        enderecoLogradouro: enderecoPayload.enderecoLogradouro,
        enderecoCidade: enderecoPayload.enderecoCidade,
        enderecoUf: enderecoPayload.enderecoUf,
        enderecoCep: enderecoPayload.enderecoCep,
      };
      await onSubmit(updatePayload);
    } else {
      const createPayload: SeguradoRequest = {
        usuarioId: data.usuarioId,
        tipoPessoa: data.tipoPessoa as "PF" | "PJ",
        nomeRazaoSocial: data.nomeRazaoSocial.trim(),
        cpfCnpj: apenasNumeros(data.cpfCnpj),
        email: data.email.trim(),
        telefone: telLimpo.length > 0 ? telLimpo : undefined,
        dataNascimento:
          data.tipoPessoa === "PF" && data.dataNascimento?.trim()
            ? data.dataNascimento
            : undefined,
        enderecoLogradouro: enderecoPayload.enderecoLogradouro,
        enderecoCidade: enderecoPayload.enderecoCidade,
        enderecoUf: enderecoPayload.enderecoUf,
        enderecoCep: enderecoPayload.enderecoCep,
      };
      await onSubmit(createPayload);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <FormErrorBanner message={errorMessage} />

      <div className="space-y-4">
        {/* Tipo de Pessoa */}
        <Controller
          name="tipoPessoa"
          control={control}
          render={({ field }) => (
            <RadioGroup
              label="Tipo de Pessoa *"
              disabled={isEdicao}
              error={errors.tipoPessoa?.message}
              name={field.name}
              value={field.value}
              options={[
                { value: "PF", label: "Pessoa Física (PF)" },
                { value: "PJ", label: "Pessoa Jurídica (PJ)" },
              ]}
              onChange={(e) => {
                const novoTipo = e.target.value as "PF" | "PJ";
                field.onChange(novoTipo);
                if (novoTipo === "PJ") {
                  setValue("dataNascimento", "");
                  clearErrors("dataNascimento");
                }
                const docAtual = getValues("cpfCnpj");
                if (docAtual) {
                  setValue("cpfCnpj", maskCpfCnpj(docAtual, novoTipo), {
                    shouldValidate: true,
                  });
                }
                clearErrors("tipoPessoa");
                clearErrors("cpfCnpj");
              }}
              onBlur={field.onBlur}
            />
          )}
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
            value={cpfCnpjValue}
            onChange={handleCpfCnpjChange}
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
            value={telefoneValue}
            onChange={handleTelefoneChange}
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Logradouro / Rua & Número */}
            <div className="md:col-span-8">
              <Input
                label="Logradouro / Rua"
                placeholder="Ex: Av. Paulista"
                error={errors.enderecoRua?.message}
                {...register("enderecoRua")}
              />
            </div>

            <div className="md:col-span-4">
              <Input
                label="Número"
                placeholder="Ex: 1000 ou S/N"
                error={errors.enderecoNumero?.message}
                {...register("enderecoNumero")}
              />
            </div>

            {/* Bairro & Complemento */}
            <div className="md:col-span-6">
              <Input
                label="Bairro"
                placeholder="Ex: Bela Vista"
                error={errors.enderecoBairro?.message}
                {...register("enderecoBairro")}
              />
            </div>

            <div className="md:col-span-6">
              <Input
                label="Complemento"
                placeholder="Ex: Apto 42, Bloco B"
                error={errors.enderecoComplemento?.message}
                {...register("enderecoComplemento")}
              />
            </div>

            {/* Cidade, UF & CEP */}
            <div className="md:col-span-5">
              <Input
                label="Cidade"
                placeholder="Ex: São Paulo"
                error={errors.enderecoCidade?.message}
                {...register("enderecoCidade")}
              />
            </div>

            <div className="md:col-span-3">
              <Select
                label="UF"
                options={UFS}
                error={errors.enderecoUf?.message}
                {...register("enderecoUf")}
              />
            </div>

            <div className="md:col-span-4">
              <Input
                label="CEP"
                placeholder="00000-000"
                error={errors.enderecoCep?.message}
                {...register("enderecoCep")}
                value={enderecoCepValue}
                onChange={handleCepChange}
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
