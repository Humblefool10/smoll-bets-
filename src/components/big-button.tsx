"use client";

import { useState } from "react";
import { t } from "@/lib/tokens";

export function BigButton({
  children,
  bg,
  onClick,
  className = "",
  disabled = false,
  loading = false,
  ariaLabel,
}: {
  children: React.ReactNode;
  bg?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={onClick}
      className={`flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fd8834] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        borderRadius: 12,
        border: `2px solid ${t.border}`,
        background: bg || t.primary,
        padding: "14px 24px",
        boxShadow: pressed ? `1px 1px 0px ${t.border}` : t.shadow,
        transform: pressed ? "translate(2px, 2px)" : "none",
        transition: "box-shadow 0.08s, transform 0.08s",
      }}
    >
      <span
        style={{
          fontFamily: t.font,
          fontWeight: 700,
          fontSize: 18,
          color: t.text,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {loading && (
          <span
            className="btn-spinner"
            style={{
              width: 18,
              height: 18,
              border: `2px solid ${t.border}33`,
              borderTopColor: t.border,
              borderRadius: "50%",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
        )}
        {children}
      </span>
    </button>
  );
}
