import React from "react";

interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <div
      className={`pt-2 border-t border-(--border) first:pt-0 first:border-t-0 ${className}`}
    >
      {title && (
        <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
