import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  FormActions,
  FormErrorBanner,
  Input,
  Modal,
  Select,
} from "../../../components/ui";
import { useAuth } from "../../../context/useAuth";
import type { PapelUsuario } from "../../../interfaces/enums";
import type { UsuarioCriadoResponse } from "../../../interfaces/auth/usuario";
import { extrairMensagemErro } from "../../../utils/errorUtils";
import { useCadastrarUsuario } from "../hooks/useUsuarios";

const criarUsuarioSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Formato de e-mail inválido")
    .max(255, "E-mail deve ter no máximo 255 caracteres"),
  papel: z.enum(["GESTOR", "ANALISTA"] as const, {
    message: "Selecione o papel do usuário",
  }),
  senha: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(72, "Senha deve ter no máximo 72 caracteres"),
});

type CriarUsuarioFormData = z.infer<typeof criarUsuarioSchema>;

interface CriarUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (criado: UsuarioCriadoResponse, senhaPlana: string) => void;
}

export const CriarUsuarioModal: React.FC<CriarUsuarioModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { usuario } = useAuth();
  const cadastrarMutation = useCadastrarUsuario();
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const isAdmin = usuario?.papel === "ADMIN";
  const defaultPapel: PapelUsuario = isAdmin ? "GESTOR" : "ANALISTA";

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<CriarUsuarioFormData>({
    resolver: zodResolver(criarUsuarioSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      email: "",
      papel: defaultPapel as "GESTOR" | "ANALISTA",
      senha: "",
    },
  });

  const nomeValue = useWatch({ control, name: "nome" });
  const emailValue = useWatch({ control, name: "email" });
  const senhaValue = useWatch({ control, name: "senha" });
  const papelValue = useWatch({ control, name: "papel" });

  const handleGerarSenha = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
    const array = new Uint32Array(12);
    window.crypto.getRandomValues(array);
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars[array[i] % chars.length];
    }
    setValue("senha", pass, { shouldValidate: true, shouldDirty: true });
    setMostrarSenha(true);
  };

  const handleClose = () => {
    reset();
    setErroApi(null);
    setMostrarSenha(false);
    onClose();
  };

  const onSubmit = async (data: CriarUsuarioFormData) => {
    setErroApi(null);
    try {
      const criado = await cadastrarMutation.mutateAsync({
        nome: data.nome.trim(),
        email: data.email.trim(),
        senha: data.senha.trim(),
        papel: data.papel,
      });
      reset();
      onSuccess(criado, data.senha.trim());
      handleClose();
    } catch (err) {
      setErroApi(extrairMensagemErro(err));
    }
  };

  const papelOptions = isAdmin
    ? [
        { value: "GESTOR", label: "Gestor (Acesso a relatórios e aprovações)" },
        { value: "ANALISTA", label: "Analista (Operações e análise de sinistros)" },
      ]
    : [
        { value: "ANALISTA", label: "Analista (Operações e análise de sinistros)" },
      ];

  const isNomeValido =
    !errors.nome && !!dirtyFields.nome && !!nomeValue && nomeValue.trim().length >= 2;
  const isEmailValido =
    !errors.email && !!dirtyFields.email && !!emailValue && emailValue.includes("@");
  const isSenhaValida =
    !errors.senha && !!senhaValue && senhaValue.length >= 8;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cadastrar Novo Usuário"
      description="Crie credenciais corporativas para novos colaboradores da seguradora."
      maxWidthClass="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormErrorBanner message={erroApi} />

        <Input
          label="Nome Completo"
          placeholder="Ex: Carlos Silva"
          required
          error={errors.nome?.message}
          isValid={isNomeValido}
          helperText={
            !errors.nome && !dirtyFields.nome
              ? "Nome e sobrenome do colaborador."
              : undefined
          }
          {...register("nome")}
        />

        <Input
          label="E-mail Corporativo"
          type="email"
          placeholder="Ex: carlos.silva@insurtech.com"
          required
          error={errors.email?.message}
          isValid={isEmailValido}
          helperText={
            !errors.email && !dirtyFields.email
              ? "Utilize o e-mail corporativo institucional."
              : undefined
          }
          {...register("email")}
        />

        <div>
          <Select
            label="Perfil de Acesso (Papel)"
            options={papelOptions}
            required
            error={errors.papel?.message}
            isValid={!errors.papel && !!papelValue}
            {...register("papel")}
          />
          {!isAdmin && (
            <p className="text-[11px] text-(--muted) mt-1">
              Como Gestor, você pode provisionar analistas operacionais.
            </p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-(--fg)">
              Senha Inicial <span className="text-red-500">*</span>
            </span>
            <button
              type="button"
              onClick={handleGerarSenha}
              className="text-[11px] font-semibold text-(--accent-ink) hover:underline cursor-pointer flex items-center gap-1"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
              Gerar senha forte
            </button>
          </div>

          <Input
            type={mostrarSenha ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            required
            error={errors.senha?.message}
            isValid={isSenhaValida}
            helperText={
              !errors.senha
                ? isSenhaValida
                  ? "Senha preenchida com tamanho seguro (8+ caracteres)."
                  : "Mínimo de 8 caracteres contendo letras e símbolos."
                : undefined
            }
            rightElement={
              <div className="flex items-center gap-1">
                {isSenhaValida && (
                  <span className="text-emerald-500 mr-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
                {errors.senha && (
                  <span className="text-red-500 mr-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setMostrarSenha((prev) => !prev)}
                  className="text-(--muted) hover:text-(--fg) p-1 cursor-pointer transition-colors"
                  title={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
                  tabIndex={-1}
                >
                  {mostrarSenha ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            }
            {...register("senha")}
          />
        </div>

        <FormActions
          onCancel={handleClose}
          isSubmitting={isSubmitting || cadastrarMutation.isPending}
          submitText="Cadastrar Usuário"
        />
      </form>
    </Modal>
  );
};

