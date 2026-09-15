import React from "react";
import { NavLink } from "react-router-dom";

export interface NavItemProps {
  to?: string;
  icon: React.ReactNode;
  label: string;
  count?: number | string;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
}

export const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  count,
  disabled = false,
  onClick,
  title,
}) => {
  const baseClasses =
    "flex items-center gap-2.5 w-full py-[9px] px-2.5 rounded-lg text-[13.5px] font-[480] text-left transition-colors duration-120";
  const activeClasses =
    "bg-(--accent-soft) text-(--accent-ink) font-semibold [&>svg]:text-(--accent-ink) ";
  const inactiveClasses =
    "text-(--muted) hover:bg-(--surface-2) hover:text-(--fg)";
  const disabledClasses =
    "opacity-55 cursor-not-allowed hover:bg-transparent text-(--muted)";

  if (disabled || !to) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        disabled={disabled}
        aria-disabled={disabled}
        className={`${baseClasses} ${disabledClasses}`}
      >
        <span className="w-4 h-4 shrink-0 flex items-center justify-center text [&>svg]:w-4 [&>svg]:h-4">
          {icon}
        </span>
        <span className="flex-1 truncate">{label}</span>
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      title={title}
      onClick={onClick}
      className={({ isActive }) =>
        `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
      }
    >
      {({ isActive }) => (
        <>
          <span className="w-4 h-4 shrink-0 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4 ">
            {icon}
          </span>
          <span className="flex-1 truncate">{label}</span>
          {count !== undefined && (
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono font-medium transition-colors ${
                isActive
                  ? "bg-(--accent-ink) text-amber-50 border border-transparent"
                  : "bg-(--surface-2) border border-(--border) text-(--accent-ink)"
              }`}
            >
              {count}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};
