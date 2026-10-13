import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Logo, ToastNotification } from "../../../components/ui";
import { useAuth } from "../../../context/useAuth";

const portalLoginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Formato de e-mail inválido")
    .max(255, "E-mail deve ter no máximo 255 caracteres"),
  senha: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(72, "Senha deve ter no máximo 72 caracteres"),
});

type PortalFormInputs = z.infer<typeof portalLoginSchema>;

const BENEFICIOS_SEGURADO = [
  {
    titulo: "Abertura 100% digital",
    descricao: "Acione sinistros de colisão, roubo ou outros eventos em poucos passos.",
    icon: (
      <svg
        className="w-5 h-5 shrink-0 text-(--accent-ink)"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    titulo: "Acompanhamento em tempo real",
    descricao: "Visualize cada etapa do processo em uma linha do tempo clara e transparente.",
    icon: (
      <svg
        className="w-5 h-5 shrink-0 text-(--accent-ink)"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    titulo: "Envio ágil de documentos",
    descricao: "Envie fotos de danos, laudos e comprovantes com upload imediato pelo navegador.",
    icon: (
      <svg
        className="w-5 h-5 shrink-0 text-(--accent-ink)"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M12 18v-6" />
        <path d="m9 15 3-3 3 3" />
      </svg>
    ),
  },
];

export const PortalLoginPage: React.FC = () => {
  const { login, isAuthenticated, usuario } = useAuth();
  const navigate = useNavigate();
  const [erroAPI, setErroAPI] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
  } = useForm<PortalFormInputs>({
    resolver: zodResolver(portalLoginSchema),
    defaultValues: { email: "", senha: "" },
  });

  useEffect(() => {
    if (isAuthenticated) {
      if (usuario?.papel === "SEGURADO") {
        navigate("/portal", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, usuario, navigate]);

  const preencherSeguradoDemo = () => {
    setValue("email", "joao@email.com", { shouldValidate: true });
    setValue("senha", "password", { shouldValidate: true });
    setErroAPI(null);
  };

  const onSubmit = async (data: PortalFormInputs) => {
    setIsLoading(true);
    setErroAPI(null);
    try {
      const user = await login({ email: data.email, senha: data.senha });
      if (user.papel === "SEGURADO") {
        navigate("/portal", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && !err.response) {
        setErroAPI(
          "Não foi possível conectar ao servidor da seguradora. Verifique se o backend está ativo.",
        );
      } else {
        setErroAPI("E-mail ou senha incorretos. Verifique suas credenciais.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col lg:flex-row bg-(--bg)">
        {/* ============================================================ */}
        {/* Lado Esquerdo (Desktop): Apresentação e Benefícios            */}
        {/* ============================================================ */}
        <div className="hidden lg:flex flex-1 flex-col justify-between py-11 px-12 bg-(--surface) border-r border-(--border)">
          <div>
            <div className="flex gap-2.5 items-center">
              <Logo size="lg" />
              <div>
                <div className="text-base font-[650] text-(--fg)">InsurTech</div>
                <div className="text-xs text-(--muted) tracking-[0.02em]">
                  Portal do Segurado
                </div>
              </div>
            </div>

            <div className="mt-10">
              <span className="text-xs font-mono font-semibold tracking-wider uppercase text-(--accent-ink) px-2.5 py-1 rounded-full bg-(--accent-soft)">
                Atendimento ao Cliente
              </span>
              <h1 className="font-[650] text-[28px] tracking-tight leading-[1.2] mt-4 text-(--fg)">
                Sua apólice e seus sinistros
                <br />
                com total transparência.
              </h1>
              <p className="mt-3 max-w-105 text-(--muted) text-[14px] leading-relaxed">
                Acompanhe o status das suas coberturas, acione sinistros com
                rapidez e envie documentos diretamente pela internet.
              </p>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            {BENEFICIOS_SEGURADO.map((b) => (
              <div
                key={b.titulo}
                className="flex gap-3.5 items-start p-3.5 rounded-xl bg-(--surface-2)/40 border border-(--border)"
              >
                <div className="p-2 rounded-lg bg-(--surface) border border-(--border)">
                  {b.icon}
                </div>
                <div>
                  <h3 className="text-[13.5px] font-[640] text-(--fg)">
                    {b.titulo}
                  </h3>
                  <p className="text-[12.5px] text-(--muted) mt-0.5 leading-relaxed">
                    {b.descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-(--border) flex items-center justify-between text-xs text-(--muted)">
            <span>Precisa de ajuda com seu seguro?</span>
            <span className="font-mono text-(--accent-ink)">0800 123 4567</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Topo Mobile: Marca e Título                                  */}
        {/* ============================================================ */}
        <div className="lg:hidden flex flex-col items-center pt-10 pb-4 px-6">
          <div className="w-16 h-16 rounded-2xl bg-(--accent-soft) flex items-center justify-center mb-3">
            <Logo size="lg" />
          </div>
          <span className="text-[11px] font-semibold font-mono tracking-widest uppercase text-(--accent-ink) px-2.5 py-0.5 rounded-full bg-(--accent-soft) mb-2">
            Portal do Segurado
          </span>
          <h1 className="text-[22px] font-bold tracking-tight text-(--fg)">
            Área do Cliente
          </h1>
          <p className="text-[13px] text-(--muted) text-center mt-1">
            Consulte apólices e acompanhe sinistros
          </p>
        </div>

        {/* ============================================================ */}
        {/* Formulário Único (Mobile e Desktop)                          */}
        {/* ============================================================ */}
        <div className="flex-1 flex items-center justify-center px-5 pb-10 lg:py-11 lg:px-12 bg-(--bg)">
          <div className="w-full max-w-sm bg-(--surface) lg:bg-transparent lg:border-0 border border-(--border) rounded-2xl p-6 lg:p-0 shadow-sm lg:shadow-none">
            <div className="hidden lg:inline-block text-[11px] text-(--accent-ink) font-semibold tracking-widest uppercase font-mono px-2 py-0.5 rounded bg-(--accent-soft) mb-2">
              Acesso Exclusivo
            </div>
            <h2 className="text-[20px] lg:text-[22px] font-semibold tracking-[-0.02em] text-(--fg)">
              Portal do Segurado
            </h2>
            <p className="text-[13px] text-(--muted) mt-1.5 mb-6">
              Entre com seu e-mail e senha cadastrados.
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="portal-email"
                  className="text-[12px] font-[620] text-(--muted)"
                >
                  Seu e-mail de segurado
                </label>
                <input
                  type="email"
                  id="portal-email"
                  {...register("email")}
                  className={`w-full h-10 px-3 border rounded-lg bg-(--surface) focus:outline-none focus:ring-2 focus:ring-(--accent-soft) focus:border-(--accent) transition-all ${
                    errors.email ? "border-red-500" : "border-(--border-strong)"
                  }`}
                  placeholder="joao@email.com"
                />
                {errors.email && (
                  <span className="text-red-500 text-[12px] mt-1 block">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5 mt-4">
                <label
                  htmlFor="portal-senha"
                  className="text-[12px] font-[620] text-(--muted)"
                >
                  Sua senha
                </label>
                <input
                  type="password"
                  id="portal-senha"
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

              {/* Acesso rápido demo para o segurado */}
              <div className="mt-4 p-2.5 rounded-lg bg-(--surface-2)/60 border border-(--border)">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-(--muted)">
                    Acesso Demonstração
                  </span>
                  <span className="font-mono text-[10.5px] text-(--muted)">
                    senha: password
                  </span>
                </div>
                <button
                  type="button"
                  onClick={preencherSeguradoDemo}
                  className="w-full text-left px-2.5 py-1 text-[11px] font-medium rounded-md bg-(--surface) border border-(--border) hover:border-(--accent) text-(--fg) hover:text-(--accent-ink) transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span>Segurado (João Silva)</span>
                  <span className="font-mono text-[10px] text-(--muted)">
                    joao@email.com
                  </span>
                </button>
              </div>

              {erroAPI && (
                <div className="text-red-500 text-[12px] mt-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                  {erroAPI}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`mt-5 w-full h-10 bg-(--accent) text-white font-semibold rounded-lg hover:brightness-105 active:brightness-95 focus:outline-none focus:ring-2 focus:ring-(--accent-soft) transition-all cursor-pointer flex items-center justify-center ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Entrando..." : "Acessar Portal do Segurado →"}
              </button>

              {/* Redirecionamento para o Painel Corporativo */}
              <div className="mt-6 pt-5 border-t border-(--border) text-center">
                <p className="text-xs text-(--muted)">
                  É analista, gestor ou colaborador interno?
                </p>
                <Link
                  to="/login"
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-(--accent-ink) hover:underline"
                >
                  <span>Acessar Painel Corporativo</span>
                  <span>→</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ToastNotification
        isOpen={logoutToastAberto}
        title="Sessão encerrada"
        message="Você saiu com segurança do Portal do Segurado."
        variant="info"
        durationMs={6000}
        onClose={() => setLogoutToastAberto(false)}
      />
    </>
  );
};
