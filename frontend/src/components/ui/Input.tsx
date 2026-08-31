import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-(--fg) mb-1"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={`w-full px-3 py-2 text-sm bg-(--surface) border rounded-lg outline-none transition-colors ${
            disabled ? "bg-(--surface-2) cursor-not-allowed opacity-75" : ""
          } ${
            error
              ? "border-(--danger) focus:border-(--danger)"
              : "border-(--border) focus:border-(--accent)"
          } ${className}`}
          {...props}
        />
        {error ? (
          <span className="text-xs text-(--danger) mt-1 block">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-(--muted) mt-1 block">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
