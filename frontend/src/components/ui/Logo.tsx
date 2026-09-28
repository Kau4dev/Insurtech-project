import React from "react";

export interface LogoProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "w-7 h-7",
  md: "w-8 h-8",
  lg: "w-9 h-9",
  xl: "w-10 h-10",
};

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  className = "",
  alt = "InsurTech Logo",
  ...props
}) => {
  return (
    <img
      src="/favicon.svg"
      alt={alt}
      draggable={false}
      className={`${sizeClasses[size]} rounded-[10px] select-none object-contain shadow-xs shrink-0 ${className}`}
      {...props}
    />
  );
};

