"use client";

import { t } from "@/lib/tokens";
import { Avatar } from "@/components/avatar";
import { Pill } from "@/components/pill";
import { StatusBar } from "@/components/status-bar";

const circles = [
  {
    name: "gym rats",
    habit: "Run 3x per week",
    members: ["Maya", "Priya", "Jordan", "Sam"],
    weeksLeft: 2,
    myRank: 2,
    total: 4,
    color: t.primaryLight,
  },
  {
    name: "book nerds",
    habit: "Read 20 pages/day",
    members: ["Alex", "Riley"],
    weeksLeft: 3,
    myRank: 1,
    total: 2,
    color: t.accentLight,
  },
  {
    name: "no scroll club",
    habit: "No social media after 9pm",
    members: ["Dana", "Chris", "Lee"],
    weeksLeft: 1,
    myRank: 3,
    total: 3,
    color: t.positiveBg,
  },
];

export function HomeScreen({
  onCircleTap,
  onProfileTap,
  onCreateCircle,
}: {
  onCircleTap?: (name: string) => void;
  onProfileTap?: () => void;
  onCreateCircle?: () => void;
}) {
  return (
    <div
      className="flex flex-col h-full"
      style={{ background: t.bg, fontFamily: t.fontBody }}
    >
      <StatusBar />
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
              hey maya. 3 active circles.
            </div>
          </div>
          <div onClick={onProfileTap} className="cursor-pointer">
            <Avatar name="Maya P" size={44} color={t.primaryBg} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-[14px]">
        {circles.map((c, i) => (
          <div
            key={i}
            onClick={() => onCircleTap?.(c.name)}
            className="cursor-pointer shadow-brutal"
            style={{
              borderRadius: 14,
              border: `2px solid ${t.border}`,
              background: c.color,
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
              <Pill color={t.bg}>{c.weeksLeft}w left</Pill>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex">
                {c.members.map((m, j) => (
                  <div
                    key={j}
                    style={{
                      marginLeft: j === 0 ? 0 : -10,
                      zIndex: c.members.length - j,
                    }}
                  >
                    <Avatar name={m} size={30} />
                  </div>
                ))}
              </div>
              <div className="text-right">
                <div
                  style={{
                    fontFamily: t.font,
                    fontWeight: 700,
                    fontSize: 15,
                    color: t.text,
                  }}
                >
                  {c.myRank === 1 ? "🥇" : c.myRank === c.total ? "😬" : "😐"}{" "}
                  #{c.myRank} of {c.total}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* new circle CTA */}
        <div
          onClick={onCreateCircle}
          role="button"
          tabIndex={0}
          aria-label="start a new circle"
          onKeyDown={(e) => e.key === "Enter" && onCreateCircle?.()}
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
