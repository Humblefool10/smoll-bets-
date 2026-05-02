"use client";

import { t } from "@/lib/tokens";
import { Avatar } from "@/components/avatar";
import { Pill } from "@/components/pill";
import type { CircleWithRole } from "@/lib/use-circles";
import { narrativeCue } from "@/lib/beats";

const CARD_COLORS = [t.primaryLight, t.accentLight, t.positiveBg];

export function HomeScreen({
  displayName = "friend",
  circles,
  onCircleTap,
  onProfileTap,
  onCreateCircle,
}: {
  displayName?: string;
  circles: CircleWithRole[];
  onCircleTap?: (id: string) => void;
  onProfileTap?: () => void;
  onCreateCircle?: () => void;
}) {

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: t.bg, fontFamily: t.fontBody }}
    >

      <div className="px-5 pt-2 pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 28,
                color: t.text,
                lineHeight: 1.1,
              }}
            >
              smoll bets
            </div>
            <div
              className="mt-[2px]"
              style={{
                fontFamily: t.fontBody,
                fontSize: 14,
                color: t.textMuted,
              }}
            >
              hey {displayName.toLowerCase()}. {circles.length} active {circles.length === 1 ? "circle" : "circles"}.
            </div>
          </div>
          <button
            type="button"
            onClick={onProfileTap}
            aria-label="open profile"
            className="cursor-pointer bg-transparent border-none p-0"
          >
            <Avatar name={displayName} size={44} color={t.primaryBg} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-[14px]">
        {circles.map((c, i) => {
          const cueText = narrativeCue(c);
          return (
          <div
            key={c.id}
            role="button"
            tabIndex={0}
            onClick={() => onCircleTap?.(c.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCircleTap?.(c.id);
              }
            }}
            className="cursor-pointer shadow-brutal stagger-in"
            style={{
              borderRadius: 14,
              border: `2px solid ${t.border}`,
              background: CARD_COLORS[i % CARD_COLORS.length],
              padding: 16,
            }}
          >
            <div className="flex justify-between items-start mb-[10px]">
              <div>
                <div
                  style={{
                    fontFamily: t.font,
                    fontWeight: 700,
                    fontSize: 18,
                    color: t.text,
                  }}
                >
                  {c.name}
                </div>
                <div
                  className="mt-[2px]"
                  style={{
                    fontFamily: t.fontBody,
                    fontSize: 13,
                    color: t.textMuted,
                  }}
                >
                  {c.habit}
                </div>
              </div>
              <Pill color={t.bg}>{cueText}</Pill>
            </div>
            <div className="flex justify-between items-center">
              <div
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 13,
                  color: t.textMuted,
                }}
              >
                {c.member_count} {c.member_count === 1 ? "member" : "members"}
              </div>
              {c.role === "creator" && (
                <Pill color={t.bgAlt}>creator</Pill>
              )}
            </div>
          </div>
          );
        })}

        {/* new circle CTA */}
        <div
          onClick={onCreateCircle}
          role="button"
          tabIndex={0}
          aria-label="start a new circle"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onCreateCircle?.();
            }
          }}
          className="flex items-center justify-center gap-[10px] cursor-pointer mb-2"
          style={{
            borderRadius: 14,
            border: `2px dashed ${t.border}`,
            padding: 16,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke={t.textMuted}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M9 3v12M3 9h12" />
          </svg>
          <span
            style={{
              fontFamily: t.fontBody,
              fontSize: 15,
              color: t.textMuted,
            }}
          >
            start a new circle
          </span>
        </div>
      </div>

      {/* safe area bottom padding */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </div>
  );
}
