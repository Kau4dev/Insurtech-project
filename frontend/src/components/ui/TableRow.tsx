import React from "react";

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <tr
      className={`hover:bg-(--surface-2)/40 transition-colors ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "center" | "right";
  children?: React.ReactNode;
}

export const TableCell: React.FC<TableCellProps> = ({
  align = "left",
  children,
  className = "",
  ...props
}) => {
  const alignClass =
    align === "right"
      ? "text-right"
      : align === "center"
        ? "text-center"
        : "text-left";

  return (
    <td className={`py-3.5 px-4 ${alignClass} ${className}`} {...props}>
      {children}
    </td>
  );
};
