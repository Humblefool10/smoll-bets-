"use client";

import { useEffect } from "react";
import { t } from "@/lib/tokens";
import { BigButton } from "@/components/big-button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: "success" | "error";
  cta?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  message,
  variant = "success",
  cta = "got it",
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const accentBg = variant === "success" ? t.positiveBg : t.danger + "15";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(26, 10, 0, 0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] shadow-brutal"
        style={{
          borderRadius: 16,
          border: `2px solid ${t.border}`,
          background: t.bg,
          padding: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            borderRadius: 10,
            border: `2px solid ${t.border}`,
            background: accentBg,
            padding: "12px 14px",
            boxShadow: t.shadowSm,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 18,
              color: t.text,
              marginBottom: 4,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontFamily: t.fontBody,
              fontSize: 14,
              color: t.textMuted,
            }}
          >
            {message}
          </div>
        </div>

        <BigButton bg={t.bgAlt} onClick={onClose} className="w-full">
          {cta}
        </BigButton>
      </div>
    </div>
  );
}
