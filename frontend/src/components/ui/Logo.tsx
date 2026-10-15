import React from "react";

export interface LogoProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "icon" | "full";
  format?: "svg" | "png";
  className?: string;
}

const iconSizeClasses: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "w-8 h-8",      // 32px
  md: "w-10 h-10",    // 40px
  lg: "w-12 h-12",    // 48px
  xl: "w-14 h-14",    // 56px
  "2xl": "w-16 h-16", // 64px
};

const fullSizeClasses: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "h-8 w-auto",     // 32px height
  md: "h-10 w-auto",    // 40px height
  lg: "h-12 w-auto",    // 48px height
  xl: "h-14 w-auto",    // 56px height
  "2xl": "h-16 w-auto", // 64px height
};

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  variant = "icon",
  format = "svg",
  className = "",
  alt = "InsurTech Logo",
  ...props
}) => {
  const ext = format === "png" ? "png" : "svg";
  const src = variant === "full" ? `/logo-full.${ext}` : `/logo-icon.${ext}`;
  const sizeClass =
    variant === "icon" ? iconSizeClasses[size] : fullSizeClasses[size];

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={`${sizeClass} select-none object-contain shrink-0 ${className}`}
      {...props}
    />
  );
};
