import React from "react";

export interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  selectedValue?: string;
  disabled?: boolean;
  error?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RadioGroup = React.forwardRef<HTMLInputElement, RadioGroupProps>(
  (
    {
      label,
      options,
      selectedValue,
      disabled = false,
      error,
      name,
      onChange,
      ...props
    },
    ref,
  ) => {
    return (
      <div>
        {label && (
          <label className="block text-xs font-semibold text-(--fg) uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <div className="flex gap-4">
          {options.map((opt) => (
            <label
              key={opt.value}
              className={`inline-flex items-center gap-2 ${
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              <input
                ref={ref}
                type="radio"
                name={name}
                value={opt.value}
                checked={
                  selectedValue !== undefined
                    ? selectedValue === opt.value
                    : undefined
                }
                disabled={disabled}
                onChange={onChange}
                className="accent-(--accent)"
                {...props}
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
