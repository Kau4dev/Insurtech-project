import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
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
    formState: { errors, isSubmitting },
  } = useForm<CriarUsuarioFormData>({
    resolver: zodResolver(criarUsuarioSchema),
    defaultValues: {
      nome: "",
      email: "",
      papel: defaultPapel as "GESTOR" | "ANALISTA",
      senha: "",
    },
  });

  const handleGerarSenha = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
    const array = new Uint32Array(12);
    window.crypto.getRandomValues(array);
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars[array[i] % chars.length];
    }
    setValue("senha", pass, { shouldValidate: true });
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
          error={errors.nome?.message}
          {...register("nome")}
        />

        <Input
          label="E-mail Corporativo"
          type="email"
          placeholder="Ex: carlos.silva@insurtech.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <Select
            label="Perfil de Acesso (Papel)"
            options={papelOptions}
            error={errors.papel?.message}
            {...register("papel")}
          />
          {!isAdmin && (
            <p className="text-[11px] text-(--muted) mt-1">
              Como Gestor, você pode provisionar analistas operacionais.
            </p>
          )}
        </div>


        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-[620] text-(--muted)">
              Senha Inicial
            </label>
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

          <div className="relative">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              className={`w-full h-10 px-3 pr-10 border rounded-lg bg-(--surface) text-(--fg) text-sm focus:outline-none focus:ring-2 focus:ring-(--accent-soft) focus:border-(--accent) transition-all ${
                errors.senha ? "border-red-500" : "border-(--border)"
              }`}
              {...register("senha")}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((prev) => !prev)}
              className="absolute right-2.5 top-2.5 text-(--muted) hover:text-(--fg) cursor-pointer"
              title={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
            >
              {mostrarSenha ? (
                <svg
                  className="w-4.5 h-4.5"
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
                  className="w-4.5 h-4.5"
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
          {errors.senha && (
            <span className="text-red-500 text-xs block">
              {errors.senha.message}
            </span>
          )}
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

