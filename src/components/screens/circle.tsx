"use client";

import { t } from "@/lib/tokens";
import { Avatar } from "@/components/avatar";
import { Pill } from "@/components/pill";
import { BigButton } from "@/components/big-button";
import { StatusBar } from "@/components/status-bar";
import { BackButton } from "@/components/back-button";
import { SettlementCard } from "@/components/screens/settlement";

const members = [
  { name: "Priya S", done: 3, target: 3, rank: 1, isMe: false, streak: 7 },
  { name: "Maya P", done: 2, target: 3, rank: 2, isMe: true, streak: 3 },
  { name: "Jordan K", done: 2, target: 3, rank: 3, isMe: false, streak: 2 },
  { name: "Sam T", done: 0, target: 3, rank: 4, isMe: false, streak: 0 },
];

const feed = [
  {
    name: "Priya S",
    time: "7:12am",
    note: "Morning 5k done. Legs said no, I said yes.",
  },
  { name: "Jordan K", time: "Yesterday", note: "Treadmill counts, right?" },
];

const rankEmoji = ["🥇", "🥈", "🥉", "😬"];

export function CircleScreen({
  onBack,
  onLog,
}: {
  onBack?: () => void;
  onLog?: () => void;
}) {
  return (
    <div
      className="flex flex-col h-full relative"
      style={{ background: t.bg }}
    >
      <StatusBar />
      <div className="px-5 pt-1 pb-3 shrink-0">
        <div className="flex items-center gap-3 mb-[10px]">
          <BackButton onClick={onBack} />
          <div
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 22,
              color: t.text,
            }}
          >
            gym rats
          </div>
          <Pill color={t.primaryLight}>2w left</Pill>
        </div>
        <div
          className="shadow-brutal-sm"
          style={{
            background: t.bgAlt,
            borderRadius: 10,
            border: `2px solid ${t.border}`,
            padding: "10px 14px",
          }}
        >
          <div
            style={{
              fontFamily: t.fontBody,
              fontSize: 12,
              color: t.textMuted,
              marginBottom: 4,
            }}
          >
            the stakes
          </div>
          <div
            style={{
              fontFamily: t.fontBody,
              fontSize: 14,
              color: t.text,
              fontWeight: 500,
            }}
          >
            loser cooks dinner for everyone. no takeout disguised as cooking.
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-3">
        {/* last week's settlement — anchors consequences before current progress */}
        <div
          style={{
            fontFamily: t.font,
            fontWeight: 700,
            fontSize: 15,
            color: t.textMuted,
            textTransform: "lowercase",
            letterSpacing: 0.5,
          }}
        >
          last week
        </div>
        <SettlementCard />

        <div
          style={{
            fontFamily: t.font,
            fontWeight: 700,
            fontSize: 15,
            color: t.textMuted,
            textTransform: "lowercase",
            letterSpacing: 0.5,
          }}
        >
          this week
        </div>

        {members.map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-3"
            style={{
              borderRadius: 12,
              border: `2px solid ${m.isMe ? t.primary : t.border}`,
              background: m.isMe ? t.primaryBg : t.bgAlt,
              padding: "12px 14px",
              boxShadow: m.isMe ? `3px 3px 0 ${t.primary}` : t.shadowSm,
            }}
          >
            <span
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 20,
                width: 28,
                textAlign: "center",
              }}
            >
              {rankEmoji[i]}
            </span>
            <Avatar
              name={m.name}
              size={38}
              color={m.isMe ? t.primaryLight : undefined}
            />
            <div className="flex-1">
              <div
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 15,
                  color: t.text,
                }}
              >
                {m.name}
                {m.isMe ? " (you)" : ""}
              </div>
              <div className="flex gap-[6px] mt-1">
                {[...Array(m.target)].map((_, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-center"
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      border: `2px solid ${t.border}`,
                      background: j < m.done ? t.positive : t.bg,
                      boxShadow:
                        j < m.done ? `1px 1px 0 ${t.border}` : "none",
                    }}
                  >
                    {j < m.done && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        stroke={t.border}
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M2 5l2.5 2.5L8 3" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 16,
                  color: m.done >= m.target ? t.positive : t.text,
                }}
              >
                {m.done}/{m.target}
              </div>
              {m.streak > 0 && (
                <div
                  style={{
                    fontFamily: t.fontBody,
                    fontSize: 11,
                    color: t.textMuted,
                  }}
                >
                  {m.streak}d 🔥
                </div>
              )}
              {m.streak === 0 && (
                <div
                  style={{
                    fontFamily: t.fontBody,
                    fontSize: 11,
                    color: t.danger,
                  }}
                >
                  gone quiet
                </div>
              )}
            </div>
          </div>
        ))}

        <div
          className="mt-1"
          style={{
            fontFamily: t.font,
            fontWeight: 700,
            fontSize: 15,
            color: t.textMuted,
            textTransform: "lowercase",
            letterSpacing: 0.5,
          }}
        >
          activity feed
        </div>

        {feed.map((f, i) => (
          <div
            key={i}
            className="flex gap-[10px] items-start shadow-brutal-sm"
            style={{
              borderRadius: 12,
              border: `2px solid ${t.border}`,
              background: t.bgAlt,
              padding: "12px 14px",
            }}
          >
            <Avatar name={f.name} size={34} />
            <div>
              <div
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 14,
                  color: t.text,
                }}
              >
                {f.name}{" "}
                <span
                  style={{
                    fontWeight: 400,
                    color: t.textMuted,
                    fontSize: 12,
                  }}
                >
                  {f.time}
                </span>
              </div>
              <div
                className="mt-[3px]"
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 13,
                  color: t.text,
                }}
              >
                {f.note}
              </div>
              <div className="mt-[6px]">
                <Pill color={t.positiveBg}>✓ logged</Pill>
              </div>
            </div>
          </div>
        ))}

        <div className="h-20" />
      </div>

      {/* floating CTA */}
      <div className="absolute bottom-6 left-5 right-5">
        <BigButton bg={t.primary} onClick={onLog}>
          log my run
        </BigButton>
      </div>
    </div>
  );
}
