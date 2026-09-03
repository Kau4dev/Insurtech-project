import React from "react";

export interface ColumnConfig {
  label: string;
  align?: "left" | "center" | "right";
  className?: string;
}

interface TableHeaderProps {
  columns: (string | ColumnConfig)[];
}

export const TableHeader: React.FC<TableHeaderProps> = ({ columns }) => {
  return (
    <thead>
      <tr className="border-b border-(--border) bg-(--surface-2)/60 text-(--muted) font-medium text-xs tracking-wider uppercase">
        {columns.map((col, idx) => {
          if (typeof col === "string") {
            return (
              <th key={idx} className="py-3.5 px-4 text-left">
                {col}
              </th>
            );
          }

          const alignClass =
            col.align === "right"
              ? "text-right"
              : col.align === "center"
                ? "text-center"
                : "text-left";

          return (
            <th
              key={idx}
              className={`py-3.5 px-4 ${alignClass} ${col.className || ""}`}
            >
              {col.label}
            </th>
          );
        })}
      </tr>
    </thead>
  );
};
