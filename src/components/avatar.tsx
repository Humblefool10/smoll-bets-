"use client";

import { t } from "@/lib/tokens";

const palette = [t.primaryLight, t.accentLight, t.positiveBg, t.bgAlt];

export function Avatar({
  name,
  size = 40,
  color,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const bg = color || palette[name.length % palette.length];

  return (
    <div
      className="flex items-center justify-center shrink-0 shadow-brutal-sm"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        border: `2px solid ${t.border}`,
        background: bg,
      }}
    >
      <span
        style={{
          fontFamily: t.font,
          fontWeight: 700,
          fontSize: size * 0.36,
          color: t.text,
        }}
      >
        {initials}
      </span>
    </div>
  );
}
