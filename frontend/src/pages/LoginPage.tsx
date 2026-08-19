import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";

const loginSchema = z.object({
  email: z
    .email("Formato de email inválido")
    .min(1, "Email é obrigatório")
    .max(255, "Email deve ter no máximo 255 caracteres"),
  senha: z
    .string()
    .min(8, "Senha é obrigatória, deve ter no mínimo 8 caracteres")
    .max(72, "Senha deve ter no máximo 72 caracteres"),
});

type FormInputs = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [erroAPI, setErroAPI] = useState<string | null>(null);
  const [isloading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  const onSubmit = async (data: FormInputs) => {
    setIsLoading(true);
    setErroAPI(null);

    try {
      await login({ email: data.email, senha: data.senha });
      navigate("/dashboard");
    } catch (error) {
      setErroAPI("E-mail ou senha incorretos. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-between py-11 px-12 bg-(--surface) border-r border-(--border)">
        <div>
          <div className="flex gap-2.5 items-center">
            <div className="w-9 h-9 rounded-[10px] bg-(--accent) text-[oklch(99%_0_0)] grid place-items-center font-[750] text-lg tracking-[0.02em]">
              S
            </div>
            <div className="">
              <div className="text-base font-[650]">Insurtech</div>
              <div className="text-xs text-(--muted) letter-spacing-[0.02em]">
                Gestão de sinistros e apólices
              </div>
            </div>
          </div>
          <div>
            <h1 className="font-[650] text-[27px] tracking-[-0.025em] leading-[1.18] mt-10">
              Operações de sinistros
              <br />
              em um único fluxo.
            </h1>
            <p className="mt-3 max-w-[430px] text-(--muted) text-[14px] leading-relaxed">
              Registro, análise, aprovação, liquidação e notificação integrados
              com mensageria event-driven.
            </p>
          </div>
        </div>
        <div className="mt-10">
          <div className="flex gap-3.5 items-start py-3.5 px-0">
            <svg
              className=" w-5 h-5 shrink-0 text-(--accent-ink) mt-px (referência: 20px, accent-ink, margin-top 1px)"
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
              className="w-5 h-5 shrink-0 text-(--accent-ink) mt-px (referência: 20px, accent-ink, margin-top 1px)"
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
              className="w-5 h-5 shrink-0 text-(--accent-ink) mt-px (referência: 20px, accent-ink, margin-top 1px)"
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

      <div className="flex-1 flex items-center justify-center py-11 px-12 bg-(--bg)">
        <form
          className="max-w-[352px] w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="text-[11px] text-(--accent-ink) font-[600] tracking-[0.1em] uppercase font-mono">
            Ambiente Interno
          </div>
          <div className="text-[22px] font-[650] tracking-[-0.02em] mt-2">
            Acessar painel
          </div>
          <p className="text-[13px] text-(--muted) mt-1.5 mb-6">
            Entre com as credenciais corporativas.
          </p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[12px] font-[620] text-(--muted)">
              E-mail corporativo
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className={`w-full h-10 px-3 border rounded-lg bg-(--surface) focus:outline-none focus:ring-2 focus:ring-(--accent-soft) focus:border-(--accent) transition-all ${
                errors.email ? "border-red-500" : "border-(--border-strong)"
              }`}
              placeholder="ana.beatriz@serena.example"
            />
            {errors.email && (
              <span className="text-red-500 text-[12px] mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 mt-4">
            <label htmlFor="senha" className="text-[12px] font-[620] text-(--muted)">
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

          {erroAPI && (
            <div className="text-red-500 text-[12px] mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded">
              {erroAPI}
            </div>
          )}
          <div className="flex justify-between items-center text-[12px] mt-6">
            <span className="text-[11.5px] text-(--faint) font-mono">
              credenciais de demonstração
            </span>
            <button
              type="button"
              className="text-(--accent-ink) hover:underline font-[620] cursor-pointer bg-transparent border-none p-0"
              onClick={() => alert("Fluxo de recuperação não incluso no protótipo.")}
            >
              Esqueci a senha
            </button>
          </div>

          <button
            type="submit"
            disabled={isloading}
            className={`mt-6 w-full h-10 bg-(--accent) text-white font-[600] rounded-lg hover:brightness-105 active:brightness-95 focus:outline-none focus:ring-2 focus:ring-(--accent-soft) transition-all cursor-pointer flex items-center justify-center ${
              isloading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isloading ? "Carregando..." : "Entrar na plataforma →"}
          </button>

        </form>
      </div>
    </div>
  );
};
