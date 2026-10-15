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
      const user = await login({ email: data.email.trim(), senha: data.senha.trim() });
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

  /* ---------------------------------------------------------------- */
  /* Campos do formulário — reutilizados nos dois layouts              */
  /* ---------------------------------------------------------------- */
  const formFields = (
    <>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="portal-email"
          className="text-[13px] sm:text-[12px] font-[620] text-(--muted)"
        >
          Seu e-mail de segurado
        </label>
        <input
          type="email"
          id="portal-email"
          autoComplete="username"
          inputMode="email"
          spellCheck={false}
          {...register("email")}
          className={`w-full h-11 sm:h-10 px-3.5 sm:px-3 text-[15px] sm:text-sm border rounded-lg bg-(--surface) focus:outline-none focus:ring-2 focus:ring-(--accent-soft) focus:border-(--accent) transition-all ${
            errors.email ? "border-red-500" : "border-(--border-strong)"
          }`}
          placeholder="segurado@dominio.com.br"
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
          className="text-[13px] sm:text-[12px] font-[620] text-(--muted)"
        >
          Sua senha
        </label>
        <input
          type="password"
          id="portal-senha"
          autoComplete="current-password"
          {...register("senha")}
          className={`w-full h-11 sm:h-10 px-3.5 sm:px-3 text-[15px] sm:text-sm border rounded-lg bg-(--surface) focus:outline-none focus:ring-2 focus:ring-(--accent-soft) focus:border-(--accent) transition-all ${
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
          className="w-full text-left px-3 py-1.5 sm:px-2.5 sm:py-1 text-xs sm:text-[11px] font-medium rounded-md bg-(--surface) border border-(--border) hover:border-(--accent) text-(--fg) hover:text-(--accent-ink) active:bg-(--surface-2) transition-colors cursor-pointer flex items-center justify-between min-h-9 sm:min-h-0"
        >
          <span>Segurado (João Silva)</span>
          <span className="font-mono text-[10.5px] sm:text-[10px] text-(--muted)">
            joao@email.com
          </span>
        </button>
      </div>

      {erroAPI && (
        <div role="alert" className="text-red-500 text-[12px] mt-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
          {erroAPI}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`mt-4 sm:mt-5 w-full h-11 sm:h-10 bg-(--accent) text-white font-semibold rounded-lg hover:brightness-105 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-(--accent-soft) transition-all cursor-pointer flex items-center justify-center text-sm ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? "Entrando..." : "Acessar Portal do Segurado →"}
      </button>

      {/* Redirecionamento para o Painel Corporativo */}
      <div className="mt-4 pt-3.5 border-t border-(--border)">
        <div className="p-3 rounded-lg bg-(--surface-2)/60 border border-(--border) hover:border-(--accent) transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-(--accent-ink)">
              Colaborador interno?
            </span>
            <span className="text-[10px] px-1.5 py-0.5 text-(--accent-ink) font-semibold font-mono">
              Operações
            </span>
          </div>
          <p className="text-[11.5px] text-(--muted) mt-1 leading-snug">
            Acesso restrito para analistas, peritos e gestores da seguradora.
          </p>
          <Link
            to="/login"
            className="mt-2 w-full py-1.5 px-3 rounded-lg bg-(--surface) border border-(--border) hover:border-(--accent) text-(--fg) hover:text-(--accent-ink) text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Acessar Painel Corporativo</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="min-h-dvh lg:min-h-screen flex flex-col justify-between lg:justify-normal lg:flex-row bg-(--bg) px-4 py-5 sm:px-6 sm:py-7 lg:p-0">
        {/* ============================================================ */}
        {/* Lado Esquerdo (Desktop): Apresentação e Benefícios            */}
        {/* ============================================================ */}
        <div className="hidden lg:flex flex-1 flex-col justify-between py-8 xl:py-11 px-8 xl:px-12 bg-(--surface) border-r border-(--border)">
          <div>
            <div className="flex gap-3 items-center">
              <Logo size="lg" />
              <div>
                <div className="text-lg font-[650] text-(--fg)">InsurTech</div>
                <div className="text-xs text-(--muted) tracking-[0.02em]">
                  Portal do Segurado
                </div>
              </div>
            </div>

            <div className="mt-6 xl:mt-8">
              <span className="text-xs font-mono font-semibold tracking-wider uppercase text-(--accent-ink)">
                Atendimento ao Cliente
              </span>
              <h1 className="font-[650] text-[24px] xl:text-[27px] tracking-tight leading-[1.22] mt-2 xl:mt-3 text-(--fg)">
                Sua apólice e seus sinistros
                <br />
                com total transparência.
              </h1>
              <p className="mt-2 max-w-105 text-(--muted) text-[13px] xl:text-[14px] leading-relaxed">
                Acompanhe o status das suas coberturas, acione sinistros com
                rapidez e envie documentos diretamente pela internet.
              </p>
            </div>

            <div className="mt-5 xl:mt-7 space-y-2.5 xl:space-y-3">
              {BENEFICIOS_SEGURADO.map((b) => (
                <div
                  key={b.titulo}
                  className="flex gap-3 items-start p-2.5 xl:p-3 rounded-xl bg-(--surface-2)/40 border border-(--border)"
                >
                  <div className="p-1.5 rounded-lg bg-(--surface) border border-(--border)">
                    {b.icon}
                  </div>
                  <div>
                    <h3 className="text-[13px] font-[640] text-(--fg)">
                      {b.titulo}
                    </h3>
                    <p className="text-[12px] text-(--muted) mt-0.5 leading-snug">
                      {b.descricao}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 xl:mt-8 xl:pt-5 border-t border-(--border) flex items-center justify-between text-xs text-(--muted)">
            <span>Precisa de ajuda com seu seguro?</span>
            <span className="font-mono text-(--accent-ink)">0800 123 4567</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Lado Direito (Desktop) / Conteúdo Principal (Mobile)         */}
        {/* ============================================================ */}
        <div className="flex-1 flex flex-col justify-between lg:justify-center items-center lg:py-8 lg:xl:py-11 lg:px-8 xl:px-12">
          {/* Topo Centralizado Premium (Mobile) */}
          <div className="lg:hidden flex flex-col items-center pt-1 pb-2 px-4 text-center">
            {/* Logo container refinado de 52px com borda sutil e sombra suave */}
            <div className="w-13 h-13 rounded-2xl bg-(--surface) border border-(--border-strong)/60 shadow-xs flex items-center justify-center p-1.5 mb-2.5">
              <Logo size="md" />
            </div>

            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-(--accent-ink) mb-0.5">
              Portal do Segurado
            </span>
            <h1 className="text-[23px] font-bold tracking-tight text-(--fg) leading-tight">
              Área do Cliente
            </h1>
            <p className="text-[12.5px] text-(--muted) text-center mt-1 max-w-xs leading-normal">
              Consulte apólices e acompanhe sinistros
            </p>
          </div>

          {/* Card do formulário (Único no DOM) */}
          <div className="w-full max-w-sm my-auto lg:my-0 py-2 sm:py-4 lg:py-0">
            <div className="bg-(--surface) lg:bg-transparent border border-(--border) lg:border-0 rounded-xl px-5 py-5 sm:px-6 sm:py-6 lg:p-0 shadow-xs lg:shadow-none">
              {/* Header do Card (Mobile) */}
              <div className="lg:hidden mb-4 pb-3 border-b border-(--border)/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-(--accent-ink) block">
                    Acesso Exclusivo
                  </span>
                  <h2 className="text-[17px] font-[650] tracking-tight text-(--fg) mt-0.5">
                    Portal do Segurado
                  </h2>
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-(--surface-2) text-(--muted) border border-(--border)">
                  Cliente
                </span>
              </div>

              {/* Header do Card (Desktop) */}
              <div className="hidden lg:block mb-5">
                <span className="text-[11px] text-(--accent-ink) font-semibold tracking-widest uppercase font-mono py-0.5 mb-2 block">
                  Acesso Exclusivo
                </span>
                <h2 className="text-[20px] lg:text-[22px] font-semibold tracking-[-0.02em] text-(--fg)">
                  Portal do Segurado
                </h2>
                <p className="text-[13px] text-(--muted) mt-1">
                  Entre com seu e-mail e senha cadastrados.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
                {formFields}
              </form>
            </div>
          </div>

          {/* Rodapé Mobile */}
          <p className="lg:hidden pt-2 pb-3 text-center text-[11px] text-(--muted)">
            InsurTech · Central de Atendimento ao Segurado (0800 123 4567)
          </p>
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
