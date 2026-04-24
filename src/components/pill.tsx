"use client";

import { t } from "@/lib/tokens";

export function Pill({
  children,
  color,
  className = "",
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center shadow-brutal-sm ${className}`}
      style={{
        borderRadius: 8,
        border: `2px solid ${t.border}`,
        background: color || t.primaryLight,
        padding: "3px 10px",
      }}
    >
      <span
        style={{
          fontFamily: t.fontBody,
          fontSize: 13,
          fontWeight: 500,
          color: t.text,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
    </div>
  );
}
