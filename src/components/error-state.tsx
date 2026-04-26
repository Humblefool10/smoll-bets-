"use client";

import { t } from "@/lib/tokens";
import { BigButton } from "@/components/big-button";

// ── error states ──────────────────────────────────────────────────────────
//
// anthropology: when something breaks, people don't want corporate
// apologies. they want honesty and a way out. humor disarms frustration.
// the CTA should always exist — never leave someone stranded.

const ERROR_CONFIGS = {
  network: {
    icon: "📡",
    title: "the internet ghosted us.",
    body: "your connection dropped. we're not mad, just disappointed.",
    cta: "try again",
  },
  notFound: {
    icon: "🕳️",
    title: "this circle doesn't exist.",
    body: "either it was deleted, or someone gave you a broken link. classic.",
    cta: "back to home",
  },
  expired: {
    icon: "⏰",
    title: "this invite expired.",
    body: "the circle moved on without you. ask for a fresh link and try not to take it personally.",
    cta: "back to home",
  },
  full: {
    icon: "🚪",
    title: "circle's full.",
    body: "they hit max capacity. you'll have to start your own and show them what they're missing.",
    cta: "start a circle",
  },
  generic: {
    icon: "🫠",
    title: "something broke.",
    body: "we don't know what happened either. the vibes are off.",
    cta: "try again",
  },
} as const;

export type ErrorType = keyof typeof ERROR_CONFIGS;

export function ErrorState({
  type,
  onAction,
}: {
  type: ErrorType;
  onAction?: () => void;
}) {
  const config = ERROR_CONFIGS[type];
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-10 px-6 gap-4"
    >
      <div style={{ fontSize: 48, marginBottom: 4 }}>{config.icon}</div>
      <div>
        <div
          style={{
            fontFamily: t.font,
            fontWeight: 700,
            fontSize: 22,
            color: t.text,
            marginBottom: 6,
          }}
        >
          {config.title}
        </div>
        <div
          style={{
            fontFamily: t.fontBody,
            fontSize: 15,
            color: t.textMuted,
            maxWidth: 280,
            lineHeight: 1.4,
            margin: "0 auto",
          }}
        >
          {config.body}
        </div>
      </div>
      {onAction && (
        <BigButton onClick={onAction} className="mt-2">
          {config.cta}
        </BigButton>
      )}
    </div>
  );
}
