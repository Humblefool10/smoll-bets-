"use client";

import { t } from "@/lib/tokens";
import { Avatar } from "@/components/avatar";
import { Pill } from "@/components/pill";
import { StatusBar } from "@/components/status-bar";
import { BackButton } from "@/components/back-button";

// ── the profile is a reputation ledger ─────────────────────────────────────
//
// anthropology: in any tribe, your standing is your history of commitments
// kept and broken. the profile isn't a settings page — it's how the group
// sees you. past circles = track record. active IOUs = debts the tribe
// remembers. the numbers tell the story before you say a word.

const stats = {
  circlesCompleted: 4,
  circlesActive: 3,
  winRate: 75,
  currentStreak: 7,
};

const activeIOUs = [
  {
    circle: "gym rats",
    week: 2,
    what: "cook dinner for the group",
    from: "Sam T",
    direction: "owed to you" as const,
  },
  {
    circle: "book nerds",
    week: 1,
    what: "buy everyone coffee",
    from: "You",
    direction: "you owe" as const,
  },
];

const pastCircles = [
  {
    name: "morning runners",
    habit: "run 3x per week",
    duration: "4 weeks",
    result: "won" as const,
    members: 4,
  },
  {
    name: "no phone zone",
    habit: "no phone after 10pm",
    duration: "2 weeks",
    result: "lost" as const,
    members: 3,
  },
  {
    name: "cook more",
    habit: "cook 4x per week",
    duration: "3 weeks",
    result: "won" as const,
    members: 5,
  },
  {
    name: "read daily",
    habit: "read 30min per day",
    duration: "4 weeks",
    result: "won" as const,
    members: 2,
  },
];

export function ProfileScreen({ onBack }: { onBack?: () => void }) {
  return (
    <div
      className="flex flex-col h-full"
      style={{ background: t.bg }}
    >
      <StatusBar />

      {/* header */}
      <div className="px-5 pt-2 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <BackButton onClick={onBack} />
          <div
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 22,
              color: t.text,
            }}
          >
            profile
          </div>
        </div>

        {/* identity card */}
        <div
          className="flex items-center gap-4 shadow-brutal"
          style={{
            borderRadius: 14,
            border: `2px solid ${t.border}`,
            background: t.primaryBg,
            padding: 16,
          }}
        >
          <Avatar name="Maya P" size={56} color={t.primaryLight} />
          <div className="flex-1">
            <div
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 20,
                color: t.text,
              }}
            >
              maya p
            </div>
            <div
              style={{
                fontFamily: t.fontBody,
                fontSize: 13,
                color: t.textMuted,
                marginTop: 2,
              }}
            >
              joined march 2026
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-4">
        {/* stats row — the reputation at a glance */}
        <div
          className="grid grid-cols-4 gap-2"
        >
          {[
            { label: "completed", value: stats.circlesCompleted },
            { label: "active", value: stats.circlesActive },
            { label: "win rate", value: `${stats.winRate}%` },
            { label: "streak", value: `${stats.currentStreak}d 🔥` },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center shadow-brutal-sm"
              style={{
                borderRadius: 10,
                border: `2px solid ${t.border}`,
                background: t.bgAlt,
                padding: "10px 4px",
              }}
            >
              <div
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 18,
                  color: t.text,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 11,
                  color: t.textMuted,
                  marginTop: 2,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* active IOUs — debts the tribe remembers */}
        <div>
          <div
            className="mb-2"
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 15,
              color: t.textMuted,
            }}
          >
            active IOUs
          </div>

          <div
            style={{
              borderRadius: 14,
              border: `2px solid ${t.border}`,
              background: t.bg,
              boxShadow: t.shadowSm,
              overflow: "hidden",
            }}
          >
            {activeIOUs.map((iou, i) => (
              <div
                key={i}
                className="flex items-start gap-3"
                style={{
                  padding: "12px 14px",
                  borderBottom:
                    i < activeIOUs.length - 1
                      ? `1px solid ${t.border}15`
                      : "none",
                }}
              >
                <div
                  className="flex items-center justify-center shrink-0 mt-[2px]"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    border: `2px solid ${t.border}`,
                    background:
                      iou.direction === "you owe"
                        ? t.danger + "22"
                        : t.positiveBg,
                    fontSize: 14,
                  }}
                >
                  {iou.direction === "you owe" ? "💸" : "🤝"}
                </div>
                <div className="flex-1">
                  <div
                    style={{
                      fontFamily: t.font,
                      fontWeight: 700,
                      fontSize: 14,
                      color: t.text,
                    }}
                  >
                    {iou.what}
                  </div>
                  <div
                    style={{
                      fontFamily: t.fontBody,
                      fontSize: 12,
                      color: t.textMuted,
                      marginTop: 2,
                    }}
                  >
                    {iou.circle} &middot; week {iou.week}
                  </div>
                </div>
                <Pill
                  color={
                    iou.direction === "you owe"
                      ? t.danger + "22"
                      : t.positiveBg
                  }
                >
                  {iou.direction}
                </Pill>
              </div>
            ))}
          </div>
        </div>

        {/* past circles — your track record */}
        <div>
          <div
            className="mb-2"
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 15,
              color: t.textMuted,
            }}
          >
            past circles
          </div>

          <div className="flex flex-col gap-2">
            {pastCircles.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-3 shadow-brutal-sm"
                style={{
                  borderRadius: 12,
                  border: `2px solid ${t.border}`,
                  background: c.result === "won" ? t.positiveBg : t.bgAlt,
                  padding: "12px 14px",
                }}
              >
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: `2px solid ${t.border}`,
                    background: c.result === "won" ? t.positive : t.danger + "33",
                    fontSize: 16,
                  }}
                >
                  {c.result === "won" ? "✓" : "✗"}
                </div>
                <div className="flex-1">
                  <div
                    style={{
                      fontFamily: t.font,
                      fontWeight: 700,
                      fontSize: 14,
                      color: t.text,
                    }}
                  >
                    {c.name}
                  </div>
                  <div
                    style={{
                      fontFamily: t.fontBody,
                      fontSize: 12,
                      color: t.textMuted,
                      marginTop: 1,
                    }}
                  >
                    {c.habit} &middot; {c.duration} &middot; {c.members} people
                  </div>
                </div>
                <Pill
                  color={c.result === "won" ? t.positiveBg : t.danger + "22"}
                >
                  {c.result}
                </Pill>
              </div>
            ))}
          </div>
        </div>

        <div className="h-6" />
      </div>

      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </div>
  );
}
