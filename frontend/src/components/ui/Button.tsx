import React from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "secondary",
  size = "md",
  icon,
  isLoading,
  disabled,
  className = "",
  type = "button",
  ...props
}) => {
  const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-3 py-2 text-sm gap-2",
    lg: "px-4 py-2.5 text-base gap-2.5",
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-(--accent) text-white hover:bg-(--accent-ink) shadow-xs",
    secondary:
      "bg-(--surface) border border-(--border) text-(--fg) hover:bg-(--surface-2) hover:border-(--border-strong) shadow-xs",
    danger:
      "bg-(--danger-soft) text-(--danger) border border-transparent hover:bg-rose-100",
    ghost:
      "bg-transparent text-(--muted) hover:bg-(--surface-2) hover:text-(--fg)",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-[500] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent) ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon && (
          <span className="shrink-0 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
            {icon}
          </span>
        )
      )}
      {children}
    </button>
  );
};
