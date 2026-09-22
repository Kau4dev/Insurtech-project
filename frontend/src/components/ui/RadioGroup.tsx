import React, { forwardRef } from "react";

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  selectedValue?: string;
  value?: string;
  disabled?: boolean;
  error?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  (
    {
      label,
      options,
      selectedValue,
      value,
      disabled = false,
      error,
      name,
      onChange,
      onBlur,
    },
    ref,
  ) => {
    const valorAtual = value !== undefined ? value : selectedValue;
    const groupName =
      name ||
      (label ? label.toLowerCase().replace(/\s+/g, "-") : "radio-group");

    return (
      <div>
        {label && (
          <label className="block text-xs font-semibold text-(--fg) uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <div className="flex gap-4">
          {options.map((opt, idx) => (
            <label
              key={opt.value}
              className={`inline-flex items-center gap-2 ${
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              <input
                ref={idx === 0 ? ref : undefined}
                type="radio"
                name={groupName}
                value={opt.value}
                checked={valorAtual === opt.value}
                disabled={disabled}
                onChange={onChange}
                onBlur={onBlur}
                className="accent-(--accent)"
              />
              <span className="text-sm font-medium text-(--fg)">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
        {error && (
          <span className="text-xs text-(--danger) mt-1 block">{error}</span>
        )}
      </div>
    );
  },
);

RadioGroup.displayName = "RadioGroup";
