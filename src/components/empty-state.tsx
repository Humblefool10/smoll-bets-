"use client";

import { t } from "@/lib/tokens";

// ── empty states ──────────────────────────────────────────────────────────
//
// anthropology: absence speaks. an empty screen is a social signal —
// "nothing happened here yet." the copy should acknowledge the void
// without being sad about it. humor reduces the friction of emptiness.

const EMPTY_CONFIGS = {
  feed: {
    icon: "👻",
    title: "crickets.",
    body: "no one's logged anything yet. be the first or forever hold your peace.",
  },
  circles: {
    icon: "🌵",
    title: "tumbleweeds.",
    body: "no circles here. start one and drag your friends into accountability.",
  },
  members: {
    icon: "🦗",
    title: "just you and the void.",
    body: "share the invite link. circles of one are just journals with trust issues.",
  },
  ious: {
    icon: "🕊️",
    title: "no debts, no drama.",
    body: "everyone's square. for now. give it a week.",
  },
  pastCircles: {
    icon: "🐣",
    title: "no track record yet.",
    body: "finish a circle to build your reputation. words are cheap, streaks aren't.",
  },
} as const;

export type EmptyType = keyof typeof EMPTY_CONFIGS;

export function EmptyState({ type }: { type: EmptyType }) {
  const config = EMPTY_CONFIGS[type];
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-8 px-6"
    >
      <div style={{ fontSize: 40, marginBottom: 8 }}>{config.icon}</div>
      <div
        style={{
          fontFamily: t.font,
          fontWeight: 700,
          fontSize: 18,
          color: t.text,
          marginBottom: 4,
        }}
      >
        {config.title}
      </div>
      <div
        style={{
          fontFamily: t.fontBody,
          fontSize: 14,
          color: t.textMuted,
          maxWidth: 260,
          lineHeight: 1.4,
        }}
      >
        {config.body}
      </div>
    </div>
  );
}
