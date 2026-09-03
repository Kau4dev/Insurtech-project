import React from "react";

interface DetailFieldProps {
  label: string;
  value?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export const DetailField: React.FC<DetailFieldProps> = ({
  label,
  value,
  fullWidth = false,
  className = "",
}) => {
  return (
    <div className={`${fullWidth ? "md:col-span-2" : ""} ${className}`}>
      <span className="text-xs text-(--muted) uppercase tracking-wider block font-medium mb-1">
        {label}
      </span>
      <div className="text-sm font-medium text-(--fg)">{value ?? "-"}</div>
    </div>
  );
};
