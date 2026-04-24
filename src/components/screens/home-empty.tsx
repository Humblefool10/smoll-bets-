"use client";

import { t } from "@/lib/tokens";
import { Avatar } from "@/components/avatar";
import { BigButton } from "@/components/big-button";
import { StatusBar } from "@/components/status-bar";

export function HomeEmptyScreen({
  onCreateCircle,
  onProfileTap,
}: {
  onCreateCircle: () => void;
  onProfileTap?: () => void;
}) {
  return (
    <div
      className="flex flex-col h-full"
      style={{ background: t.bg, fontFamily: t.fontBody }}
    >
      <StatusBar />

      {/* header — same as populated home for continuity */}
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
              hey maya. no active circles yet.
            </div>
          </div>
          <button
            type="button"
            onClick={onProfileTap}
            aria-label="open profile"
            className="cursor-pointer bg-transparent border-none p-0"
          >
            <Avatar name="Maya P" size={44} color={t.primaryBg} />
          </button>
        </div>
      </div>

      {/* empty state — designed to look like a ghost of the future populated state */}
      <div className="flex-1 px-5 flex flex-col">
        {/* the ghost card: looks like a circle card but IS the CTA.
            gestalt similarity — previews what the screen will look like.
            closure tension — the brain wants to complete the pattern. */}
        <div
          role="button"
          tabIndex={0}
          onClick={onCreateCircle}
          onKeyDown={(e) => e.key === "Enter" && onCreateCircle()}
          className="cursor-pointer"
          style={{
            borderRadius: 14,
            border: `2px solid ${t.border}`,
            background: t.primaryBg,
            padding: 20,
            boxShadow: t.shadow,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex items-center justify-center"
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                border: `2px solid ${t.border}`,
                background: t.primary,
                boxShadow: t.shadowSm,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={t.border}
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 18,
                  color: t.text,
                }}
              >
                start your first circle
              </div>
              <div
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 13,
                  color: t.textMuted,
                  marginTop: 2,
                }}
              >
                pick a habit, set the stakes, drag your friends in
              </div>
            </div>
          </div>

          <BigButton className="w-full">let&apos;s make a bet</BigButton>
        </div>

        {/* social nudge — creates urgency without guilt */}
        <div className="mt-6 px-2">
          <div
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 15,
              color: t.textMuted,
              marginBottom: 12,
            }}
          >
            how it works
          </div>

          {[
            {
              step: "1",
              title: "pick a habit, name your circle",
              desc: "running, reading, no doomscrolling. anything goes.",
            },
            {
              step: "2",
              title: "set the stakes",
              desc: "loser cooks dinner. loser buys coffee. make it personal.",
            },
            {
              step: "3",
              title: "invite your people",
              desc: "share a link. they join in one tap. no app download.",
            },
            {
              step: "4",
              title: "the circle watches",
              desc: "log your activity. see who's slacking. settle up weekly.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex gap-3 items-start mb-4"
            >
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: `2px solid ${t.border}`,
                  background: t.bgAlt,
                  boxShadow: t.shadowSm,
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 13,
                  color: t.text,
                }}
              >
                {item.step}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: t.font,
                    fontWeight: 600,
                    fontSize: 14,
                    color: t.text,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontFamily: t.fontBody,
                    fontSize: 13,
                    color: t.textMuted,
                    marginTop: 1,
                  }}
                >
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </div>
  );
}
