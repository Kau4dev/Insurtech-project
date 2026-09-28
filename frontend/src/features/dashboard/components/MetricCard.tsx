import React from "react";

export interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  trendText?: string;
  trendBadge?: string;
  trendVariant?: "positive" | "info" | "neutral";
  subtitle?: string;
  isLoading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trendText,
  trendBadge,
  trendVariant = "positive",
  subtitle,
  isLoading = false,
}) => {
  return (
    <div className="bg-(--surface) border border-(--border) rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-(--accent)/40 transition-colors">
      {/* Top row: Title and Icon */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium text-(--muted) tracking-tight">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>

      {/* Middle row: Big metric value */}
      <div className="my-3">
        {isLoading ? (
          <div className="h-8 w-24 bg-(--surface-2) animate-pulse rounded-md" />
        ) : (
          <div className="text-[28px] font-bold text-(--fg) tracking-tight leading-none">
            {value}
          </div>
        )}
      </div>

      {/* Bottom row: Trend or badge + Subtitle */}
      <div className="flex items-center gap-1.5 text-[12px] min-h-[20px]">
        {trendBadge && (
          <span
            className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
              trendVariant === "info"
                ? "bg-sky-50 text-sky-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {trendBadge}
          </span>
        )}

        {trendText && (
          <span
            className={`font-semibold text-[12px] ${
              trendVariant === "positive"
                ? "text-emerald-600"
                : trendVariant === "info"
                ? "text-sky-600"
                : "text-(--muted)"
            }`}
          >
            {trendText}
          </span>
        )}

        {subtitle && (
          <span className="text-(--muted) tracking-tight truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

