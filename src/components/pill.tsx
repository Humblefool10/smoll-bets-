"use client";

import { t } from "@/lib/tokens";

export function Pill({
  children,
  color,
  className = "",
  wrap = false,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
  wrap?: boolean;
}) {
  return (
    <div
      className={`${wrap ? "inline-block max-w-full" : "inline-flex items-center"} shadow-brutal-sm ${className}`}
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
          whiteSpace: wrap ? "normal" : "nowrap",
          wordBreak: wrap ? "break-word" : undefined,
        }}
      >
        {children}
      </span>
    </div>
  );
}
