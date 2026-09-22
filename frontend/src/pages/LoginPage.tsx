import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Logo, ToastNotification } from "../components/ui";
import { useAuth } from "../context/useAuth";

const loginSchema = z.object({
  email: z
    .email("Formato de email inválido")
    .min(1, "Email é obrigatório")
    .max(255, "Email deve ter no máximo 255 caracteres"),
  senha: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(72, "Senha deve ter no máximo 72 caracteres"),
});

type FormInputs = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [erroAPI, setErroAPI] = useState<string | null>(null);
  const [isloading, setIsLoading] = useState(false);
  const [logoutToastAberto, setLogoutToastAberto] = useState<boolean>(() => {
    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem("insurtech_logout") === "true"
    ) {
      sessionStorage.removeItem("insurtech_logout");
      return true;
    }
    return false;
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  // Se já estiver logado, redireciona diretamente ao dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const preencherCredencial = (email: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("senha", "password", { shouldValidate: true });
    setErroAPI(null);
  };

  const onSubmit = async (data: FormInputs) => {
    setIsLoading(true);
    setErroAPI(null);

    try {
      await login({ email: data.email, senha: data.senha });
      navigate("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && !err.response) {
        setErroAPI(
          "Não foi possível conectar ao Gateway (:8080). Certifique-se de que os serviços backend estão em execução.",
        );
      } else {
        setErroAPI("E-mail ou senha incorretos. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1 flex flex-col justify-between py-8 px-6 sm:py-11 sm:px-12 bg-(--surface) border-b lg:border-b-0 lg:border-r border-(--border)">
        <div>
          <div className="flex gap-2.5 items-center">
            <Logo size="lg" />
            <div>
              <div className="text-base font-[650] text-(--fg)">InsurTech</div>
              <div className="text-xs text-(--muted) tracking-[0.02em]">
                Gestão de sinistros e apólices
              </div>
            </div>
          </div>
          <div>
            <h1 className="font-[650] text-2xl sm:text-[27px] tracking-tight leading-[1.18] mt-6 sm:mt-10">
              Operações de sinistros
              <br />
              em um único fluxo.
            </h1>
            <p className="mt-3 max-w-107.5 text-(--muted) text-[14px] leading-relaxed">
              Registro, análise, aprovação, liquidação e notificação integrados
              com mensageria event-driven.
            </p>
          </div>
        </div>
        <div className="mt-8 sm:mt-10">
          <div className="flex gap-3.5 items-start py-3.5 px-0">
            <svg
              className="w-5 h-5 shrink-0 text-(--accent-ink) mt-px"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M4 7h16v12H4z" />
              <path d="M8 3v4M16 3v4" />
              <path d="M8 12h8M8 15h5" />
            </svg>
            <div>
              <b className="block text-[13.5px] font-[640]">Fila de trabalho</b>
              <span className="text-[12.5px] text-(--muted)">
                Sinistros por prioridade, tempo e valor estimado.
              </span>
            </div>
          </div>
          <div className="flex gap-3.5 items-start py-3.5 px-0 border-t border-(--border)">
            <svg
              className="w-5 h-5 shrink-0 text-(--accent-ink) mt-px"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M12 3a9 9 0 1 0 9 9" />
              <path d="M12 7v5l3 2" />
            </svg>
            <div>
              <b className="block text-[13.5px] font-[640]">
                Aprovação com regras de domínio
              </b>
              <span className="text-[12.5px] text-(--muted)">
                Valida apólice ativa e limite da cobertura na API.
              </span>
            </div>
          </div>
          <div className="flex gap-3.5 items-start py-3.5 px-0 border-t border-(--border)">
            <svg
              className="w-5 h-5 shrink-0 text-(--accent-ink) mt-px"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M3 12h4l2-7 4 14 2-7h6" />
            </svg>
            <div>
              <b className="block text-[13.5px] font-[640]">
                Pipeline de mensageria
              </b>
              <span className="text-[12.5px] text-(--muted)">
                Aprovação → liquidação → notificação via Kafka.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-8 px-6 sm:py-11 sm:px-12 bg-(--bg)">
        <form
          className="max-w-88 w-full my-auto"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="text-[11px] text-(--accent-ink) font-semibold tracking-widest uppercase font-mono">
            Ambiente Interno
          </div>
          <div className="text-[22px] font-semibold tracking-[-0.02em] mt-2">
            Acessar painel
          </div>
          <p className="text-[13px] text-(--muted) mt-1.5 mb-6">
            Entre com as credenciais corporativas.
          </p>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-[12px] font-[620] text-(--muted)"
            >
              E-mail corporativo
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className={`w-full h-10 px-3 border rounded-lg bg-(--surface) focus:outline-none focus:ring-2 focus:ring-(--accent-soft) focus:border-(--accent) transition-all ${
                errors.email ? "border-red-500" : "border-(--border-strong)"
              }`}
              placeholder="analista@insurtech.com"
            />
            {errors.email && (
              <span className="text-red-500 text-[12px] mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 mt-4">
            <label
              htmlFor="senha"
              className="text-[12px] font-[620] text-(--muted)"
            >
              Senha
            </label>
            <input
              type="password"
              id="senha"
              {...register("senha")}
              className={`w-full h-10 px-3 border rounded-lg bg-(--surface) focus:outline-none focus:ring-2 focus:ring-(--accent-soft) focus:border-(--accent) transition-all ${
                errors.senha ? "border-red-500" : "border-(--border-strong)"
              }`}
              placeholder="••••••••"
            />
            {errors.senha && (
              <span className="text-red-500 text-[12px] mt-1 block">
                {errors.senha.message}
              </span>
            )}
          </div>

          {/* Atalhos com as contas do backend */}
          <div className="mt-4 p-2.5 rounded-lg bg-(--surface-2)/60 border border-(--border)">
            <div className="flex items-center justify-between text-[11.5px] mb-2 text-(--muted)">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Acesso Rápido
              </span>
              <span className="font-mono text-[10.5px]">senha: password</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => preencherCredencial("admin@insurtech.com")}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-(--surface) border border-(--border) hover:border-(--accent) text-(--fg) hover:text-(--accent-ink) transition-colors cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => preencherCredencial("analista@insurtech.com")}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-(--surface) border border-(--border) hover:border-(--accent) text-(--fg) hover:text-(--accent-ink) transition-colors cursor-pointer"
              >
                Analista
              </button>
              <button
                type="button"
                onClick={() => preencherCredencial("gestor@insurtech.com")}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-(--surface) border border-(--border) hover:border-(--accent) text-(--fg) hover:text-(--accent-ink) transition-colors cursor-pointer"
              >
                Gestor
              </button>
            </div>
          </div>

          {erroAPI && (
            <div className="text-red-500 text-[12px] mt-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
              {erroAPI}
            </div>
          )}

          <button
            type="submit"
            disabled={isloading}
            className={`mt-5 w-full h-10 bg-(--accent) text-white font-semibold rounded-lg hover:brightness-105 active:brightness-95 focus:outline-none focus:ring-2 focus:ring-(--accent-soft) transition-all cursor-pointer flex items-center justify-center ${
              isloading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isloading ? "Carregando..." : "Entrar na plataforma →"}
          </button>
        </form>
      </div>

      {/* Popup de Sessão Encerrada (conforme imagem 1) */}
      <ToastNotification
        isOpen={logoutToastAberto}
        title="Sessão encerrada"
        message="Volte quando precisar."
        variant="info"
        durationMs={6000}
        onClose={() => setLogoutToastAberto(false)}
      />
    </div>
  );
};
