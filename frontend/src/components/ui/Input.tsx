import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isValid?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  ref?: React.Ref<HTMLInputElement>;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isValid,
  helperText,
  leftIcon,
  rightElement,
  className = "",
  id,
  disabled,
  required,
  ref,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  // Determina se o ícone de status automático (erro ou sucesso) deve ser exibido
  const showStatusIcon = !rightElement && (!!error || !!isValid);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-(--fg) mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-(--muted)">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          className={`w-full h-10 py-2 text-sm bg-(--surface) text-(--fg) border rounded-lg outline-none transition-all ${
            leftIcon ? "pl-9" : "px-3"
          } ${
            rightElement || showStatusIcon ? "pr-9" : "px-3"
          } ${
            disabled ? "bg-(--surface-2) text-(--muted) cursor-not-allowed opacity-75" : ""
          } ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
              : isValid
                ? "border-emerald-500/70 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                : "border-(--border) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft)"
          } ${className}`}
          {...props}
        />

        {rightElement ? (
          <div className="absolute right-2.5 flex items-center">{rightElement}</div>
        ) : error ? (
          <div className="absolute right-3 flex items-center pointer-events-none text-red-500 animate-in fade-in duration-200">
            <svg
              className="w-4 h-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        ) : isValid ? (
          <div className="absolute right-3 flex items-center pointer-events-none text-emerald-500 animate-in fade-in duration-200">
            <svg
              className="w-4 h-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        ) : null}
      </div>

      {error ? (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium animate-in fade-in duration-150"
        >
          <svg
            className="w-3.5 h-3.5 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="text-xs text-(--muted) mt-1.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

Input.displayName = "Input";
