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
  const activeClasses = "bg-(--accent-soft) text-(--accent-ink) font-semibold";
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
      className={({ isActive }) =>
        `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
      }
    >
      <span className="w-4 h-4 shrink-0 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4 text-(--accent-ink) ">
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-(--surface-2) border border-(--border) font-mono font-medium text-(--accent-ink) ">
          {count}
        </span>
      )}
    </NavLink>
  );
};
