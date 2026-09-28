import React, { useEffect } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidthClass = "max-w-3xl",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative w-full ${maxWidthClass} max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] flex flex-col z-10 bg-(--surface) border border-(--border) rounded-(--radius) shadow-lg overflow-hidden my-auto`}
        role="dialog"
        aria-modal="true"
      >
        {(title || description) && (
          <div className="shrink-0 border-b border-(--border) px-4 py-3.5 sm:px-6 sm:py-4 flex items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              {title && (
                <h2 className="text-base sm:text-lg font-semibold text-(--fg) truncate">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs sm:text-sm text-(--muted) mt-0.5 break-words">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-(--muted) hover:text-(--fg) p-1 rounded-lg hover:bg-(--surface-2) transition-colors shrink-0 cursor-pointer"
              title="Fechar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};
