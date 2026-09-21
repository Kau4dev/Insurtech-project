import React, { useEffect } from "react";

export type ToastVariant = "success" | "info" | "warning" | "error";

export interface ToastProps {
  isOpen: boolean;
  title: string;
  message?: string;
  variant?: ToastVariant;
  durationMs?: number;
  onClose?: () => void;
  className?: string;
}

const variantDotColors: Record<ToastVariant, string> = {
  success: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
  info: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]",
  warning: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
  error: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
};

export const ToastNotification: React.FC<ToastProps> = ({
  isOpen,
  title,
  message,
  variant = "success",
  durationMs = 5000,
  onClose,
  className = "",
}) => {
  useEffect(() => {
    if (!isOpen || durationMs <= 0) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [isOpen, durationMs, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 flex items-start gap-3 py-3 px-4 bg-slate-900/95 backdrop-blur-md text-white border border-slate-800 rounded-2xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 select-none max-w-sm ${className}`}
    >
      {/* Ponto indicador colorido */}
      <div className="pt-1">
        <span
          className={`block w-2.5 h-2.5 rounded-full ${variantDotColors[variant]}`}
        />
      </div>

      {/* Conteúdo textual */}
      <div className="flex-1 pr-1">
        <div className="text-[13px] font-semibold tracking-tight text-slate-100">
          {title}
        </div>
        {message && (
          <div className="text-[11.5px] text-slate-400 mt-0.5 leading-snug">
            {message}
          </div>
        )}
      </div>

      {/* Botão de fechar sutil */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded-lg -mr-1 -mt-0.5"
          aria-label="Fechar notificação"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

