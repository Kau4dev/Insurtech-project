import React from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  isValid?: boolean;
  helperText?: string;
  options: readonly (string | SelectOption)[];
  placeholder?: string;
  ref?: React.Ref<HTMLSelectElement>;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  isValid,
  helperText,
  options,
  placeholder = "--",
  className = "",
  id,
  disabled,
  required,
  ref,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  const hasEmptyOption = options.some((opt) =>
    typeof opt === "string" ? opt === "" : opt.value === ""
  );

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-medium text-(--fg) mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
        }
        className={`w-full h-10 px-3 py-2 text-sm bg-(--surface) text-(--fg) border rounded-lg outline-none transition-all ${
          disabled ? "bg-(--surface-2) text-(--muted) cursor-not-allowed opacity-75" : ""
        } ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
            : isValid
              ? "border-emerald-500/70 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
              : "border-(--border) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft)"
        } ${className}`}
        {...props}
      >
        {placeholder && !hasEmptyOption && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const lbl = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error ? (
        <p
          id={`${selectId}-error`}
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
        <p id={`${selectId}-helper`} className="text-xs text-(--muted) mt-1.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

Select.displayName = "Select";
