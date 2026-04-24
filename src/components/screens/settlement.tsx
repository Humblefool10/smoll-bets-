"use client";

import { useState } from "react";
import { t } from "@/lib/tokens";
import { Pill } from "@/components/pill";

const standings = [
  { name: "priya", runs: 3, status: "safe" as const, note: "untouchable. annoying." },
  {
    name: "maya",
    runs: 3,
    status: "safe" as const,
    note: "clutched it on sunday. we saw that.",
  },
  {
    name: "jordan",
    runs: 2,
    status: "safe" as const,
    note: "technically safe. spiritually last.",
  },
  {
    name: "sam",
    runs: 0,
    status: "owes" as const,
    note: "zero. absolutely zero. you owe everyone dinner.",
  },
];

export function SettlementCard() {
  const [visible, setVisible] = useState(false);

  return (
    <div className="w-full">
      <div
        onClick={() => setVisible(!visible)}
        className="flex justify-between items-center cursor-pointer shadow-brutal"
        style={{
          borderRadius: 12,
          border: `2px solid ${t.border}`,
          background: t.primaryLight,
          padding: "12px 16px",
        }}
      >
        <span
          style={{
            fontFamily: t.font,
            fontWeight: 700,
            fontSize: 15,
            color: t.text,
          }}
        >
          week 2 settlement 🍽️
        </span>
        <span style={{ fontSize: 18 }}>{visible ? "▲" : "▼"}</span>
      </div>

      {visible && (
        <div
          style={{
            borderRadius: "0 0 12px 12px",
            border: `2px solid ${t.border}`,
            borderTop: "none",
            background: t.bg,
            padding: 16,
            boxShadow: `3px 3px 0 ${t.border}`,
          }}
        >
          <div
            className="mb-2"
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 18,
              color: t.text,
            }}
          >
            final standings, week 2.
          </div>

          {standings.map((m, i) => (
            <div
              key={i}
              className="flex justify-between items-start"
              style={{
                padding: "10px 0",
                borderTop:
                  i > 0 ? `1px solid ${t.border}22` : "none",
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: t.font,
                    fontWeight: 700,
                    fontSize: 14,
                    color: t.text,
                  }}
                >
                  {m.name}
                </span>
                <div
                  className="mt-[2px]"
                  style={{
                    fontFamily: t.fontBody,
                    fontSize: 12,
                    color: t.textMuted,
                  }}
                >
                  {m.note}
                </div>
              </div>
              <Pill
                color={
                  m.status === "owes" ? t.danger + "33" : t.positiveBg
                }
              >
                {m.runs}/3 {m.status === "owes" ? "💸" : "✓"}
              </Pill>
            </div>
          ))}

          <div
            className="mt-3"
            style={{
              padding: 12,
              borderRadius: 10,
              border: `2px solid ${t.border}`,
              background: t.primaryBg,
            }}
          >
            <div
              style={{
                fontFamily: t.fontBody,
                fontSize: 14,
                color: t.text,
              }}
            >
              sam owes the group a home-cooked dinner. no takeout disguised
              as cooking. the circle will know.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
