"use client";

import { t } from "@/lib/tokens";

// a single row inside a popover menu. flat button styling, hover/focus highlight.
// not BigButton — those are too chunky for a small menu. matches the brutal
// aesthetic via parent container border + shadow, so the row itself stays light.

export function PopoverItem({
  onClick,
  children,
  danger = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? t.danger + "12" : t.bgAlt;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
      onFocus={(e) => {
        e.currentTarget.style.background = danger ? t.danger + "12" : t.bgAlt;
      }}
      onBlur={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
      className="cursor-pointer w-full text-left"
      style={{
        fontFamily: t.fontBody,
        fontSize: 14,
        fontWeight: 500,
        color: danger ? t.danger : t.text,
        background: "transparent",
        border: "none",
        borderRadius: 8,
        padding: "10px 12px",
        outline: "none",
      }}
    >
      {children}
    </button>
  );
}
