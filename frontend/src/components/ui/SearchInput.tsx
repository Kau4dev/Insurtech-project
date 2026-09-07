import React from "react";

interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  value: string;
  onValueChange: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onValueChange,
  placeholder = "Buscar...",
  className = "",
  ...props
}) => {
  return (
    <div className={`relative flex-1 w-full ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 text-sm bg-(--surface) border border-(--border) rounded-lg outline-none focus:border-(--accent) text-(--fg) placeholder:text-(--faint) transition-colors"
        {...props}
      />
      <svg
        className="absolute left-3 top-2.5 h-4 w-4 text-(--muted)"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
};
