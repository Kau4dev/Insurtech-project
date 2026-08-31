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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${maxWidthClass} my-8 z-10 bg-(--surface) border border-(--border) rounded-(--radius) shadow-lg overflow-hidden`}
        role="dialog"
        aria-modal="true"
      >
        {(title || description) && (
          <div className="border-b border-(--border) p-6 pb-4 flex items-start justify-between gap-4">
            <div>
              {title && <h2 className="text-lg font-semibold text-(--fg)">{title}</h2>}
              {description && (
                <p className="text-sm text-(--muted) mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-(--muted) hover:text-(--fg) p-1 rounded-lg hover:bg-(--surface-2) transition-colors"
              title="Fechar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
