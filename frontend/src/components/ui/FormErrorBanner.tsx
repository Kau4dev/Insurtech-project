import React from "react";

interface FormErrorBannerProps {
  message?: string | null;
}

export const FormErrorBanner: React.FC<FormErrorBannerProps> = ({
  message,
}) => {
  if (!message) return null;

  return (
    <div className="p-3.5 rounded-lg bg-(--danger-soft) border border-rose-200 text-(--danger) text-sm flex items-center gap-2">
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
};
