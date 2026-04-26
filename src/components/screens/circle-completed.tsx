"use client";

import { useEffect, useRef, useState } from "react";
import { t } from "@/lib/tokens";
import { Avatar } from "@/components/avatar";
import { Pill } from "@/components/pill";
import { BigButton } from "@/components/big-button";
import { BackButton } from "@/components/back-button";
import { Confetti } from "@/components/confetti";
import { LoadingScreen } from "@/components/loading";
import { playCelebrate } from "@/lib/sounds";
import { fetchSettlement } from "@/lib/circles";
import type { Settlement, SettlementResult } from "@/lib/circles";
import { useAuth } from "@/lib/use-auth";


type Outcome = "all-clear" | "someone-owes" | "nobody-showed";

const OUTCOME_HEADER = {
  "all-clear": {
    icon: "🏆",
    title: "the circle held.",
    subtitle: "everyone showed up. no one owes anything. that's rare and you should feel good about it.",
    bg: t.positiveBg,
  },
  "someone-owes": {
    icon: "⚖️",
    title: "the verdict is in.",
    subtitle: "some showed up. some didn't. you know how this works.",
    bg: t.primaryBg,
  },
  "nobody-showed": {
    icon: "🪦",
    title: "well, that happened.",
    subtitle: "nobody hit the target. no winner, no loser, just a collective learning experience.",
    bg: t.bgAlt,
  },
} as const;

const OUTCOME_CTA = {
  "all-clear": "run it back",
  "someone-owes": "run it back",
  "nobody-showed": "try again, for real this time",
} as const;

function getNote(r: SettlementResult, outcome: Outcome, winTarget: number): string {
  if (outcome === "nobody-showed") {
    if (r.total_logs === 0) return "didn't even pretend to try.";
    return `${r.total_logs}/${winTarget}. points for effort, but still short.`;
  }
  if (r.won) {
    if (r.total_logs === winTarget) return "clean sheet. respect.";
    return "overachiever. we see you.";
  }
  if (r.total_logs === 0) return "zero. absolute zero.";
  if (r.total_logs >= winTarget - 2) return "so close. so, so close.";
  return `${r.total_logs}/${winTarget}. not enough.`;
}

export function CircleCompletedScreen({
  circleId,
  onBack,
  onRunItBack,
}: {
  circleId: string | null;
  onBack?: () => void;
  onRunItBack?: () => void;
}) {
  const { user } = useAuth();
  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [loading, setLoading] = useState(true);
  const celebratedRef = useRef(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!circleId) return;
    fetchSettlement(circleId).then((s) => {
      setSettlement(s);
      setLoading(false);
    });
  }, [circleId]);

  const outcome = settlement?.outcome ?? "nobody-showed";
  const header = OUTCOME_HEADER[outcome];
  const results = settlement?.results ?? [];
  const circleName = settlement?.circle.name ?? "";
  const stakes = settlement?.circle.stakes ?? "";
  const habit = settlement?.circle.habit ?? "";
  const durationWeeks = settlement?.circle.duration_weeks ?? 0;

  const winTarget = settlement?.win_target ?? 0;
  const losers = results.filter((r) => !r.won);
  const winners = results.filter((r) => r.won);

  useEffect(() => {
    if (outcome === "all-clear" && !celebratedRef.current && !loading) {
      celebratedRef.current = true;
      playCelebrate();
    }
  }, [outcome, loading]);

  if (loading) {
    return (
      <div className="flex flex-col h-full" style={{ background: t.bg }}>
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: t.bg }}>
      {outcome === "all-clear" && <Confetti count={40} />}

      {/* header */}
      <div className="px-5 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <BackButton onClick={onBack} />
          <div
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 18,
              color: t.text,
            }}
          >
            {circleName}
          </div>
          <Pill color={t.bgAlt}>completed</Pill>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-4">
        {/* outcome banner */}
        <div
          className="shadow-brutal text-center"
          style={{
            borderRadius: 16,
            border: `2px solid ${t.border}`,
            background: header.bg,
            padding: "24px 20px",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 8 }}>{header.icon}</div>
          <div
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 24,
              color: t.text,
              lineHeight: 1.1,
              marginBottom: 8,
            }}
          >
            {header.title}
          </div>
          <div
            style={{
              fontFamily: t.fontBody,
              fontSize: 14,
              color: t.textMuted,
              lineHeight: 1.4,
              maxWidth: 280,
              margin: "0 auto",
            }}
          >
            {header.subtitle}
          </div>
        </div>

        {/* final standings */}
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
            final standings
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
            {results.map((r, i) => {
              const isMe = r.user_id === user?.id;
              return (
              <div
                key={r.user_id}
                className="flex items-center gap-3 stagger-in"
                style={{
                  padding: "12px 14px",
                  borderBottom:
                    i < results.length - 1
                      ? `1px solid ${t.border}15`
                      : "none",
                  background: isMe ? t.primaryBg : "transparent",
                }}
              >
                <span
                  style={{
                    fontFamily: t.font,
                    fontWeight: 700,
                    fontSize: 16,
                    width: 24,
                    textAlign: "center",
                  }}
                >
                  {i + 1}.
                </span>
                <Avatar
                  name={r.display_name}
                  size={36}
                  color={isMe ? t.primaryLight : undefined}
                />
                <div className="flex-1">
                  <div
                    style={{
                      fontFamily: t.font,
                      fontWeight: 700,
                      fontSize: 14,
                      color: t.text,
                    }}
                  >
                    {r.display_name}
                    {isMe && (
                      <span
                        style={{
                          fontWeight: 400,
                          color: t.textMuted,
                          fontSize: 12,
                          marginLeft: 4,
                        }}
                      >
                        (you)
                      </span>
                    )}
                  </div>
                  <div
                    className="mt-[2px]"
                    style={{
                      fontFamily: t.fontBody,
                      fontSize: 12,
                      color: t.textMuted,
                    }}
                  >
                    {getNote(r, outcome, winTarget)}
                  </div>
                </div>
                <Pill
                  color={
                    r.won ? t.positiveBg : t.danger + "22"
                  }
                >
                  {r.total_logs}/{winTarget}{" "}
                  {r.won ? "✓" : "✗"}
                </Pill>
              </div>
              );
            })}
          </div>
        </div>

        {/* the ruling — only when someone owes */}
        {outcome === "someone-owes" && losers.length > 0 && (
          <div
            className="shadow-brutal-sm"
            style={{
              borderRadius: 14,
              border: `2px solid ${t.border}`,
              background: t.primaryBg,
              padding: 16,
            }}
          >
            <div
              className="mb-1"
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 15,
                color: t.text,
              }}
            >
              the ruling
            </div>
            <div
              style={{
                fontFamily: t.fontBody,
                fontSize: 14,
                color: t.text,
                lineHeight: 1.5,
              }}
            >
              {losers.length === 1
                ? `${losers[0].display_name.split(" ")[0].toLowerCase()} owes ${
                    winners.length > 0
                      ? "the group"
                      : "everyone"
                  }: ${stakes}. no shortcuts, no substitutions. the circle will know.`
                : `${losers
                    .map((l) => l.display_name.split(" ")[0].toLowerCase())
                    .join(" and ")} owe the group: ${stakes}. they do it together. splitting the shame doesn't reduce it.`}
            </div>
          </div>
        )}

        {/* all clear — group appreciation */}
        {outcome === "all-clear" && (
          <div
            className="shadow-brutal-sm"
            style={{
              borderRadius: 14,
              border: `2px solid ${t.border}`,
              background: t.positiveBg,
              padding: 16,
            }}
          >
            <div
              className="mb-1"
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 15,
                color: t.text,
              }}
            >
              no debts, no drama
            </div>
            <div
              style={{
                fontFamily: t.fontBody,
                fontSize: 14,
                color: t.text,
                lineHeight: 1.5,
              }}
            >
              {results.length} {results.length === 1 ? "person" : "people"} said they&apos;d do something and all {results.length} actually did it. in a world of broken promises, that&apos;s worth celebrating.
            </div>
          </div>
        )}

        {/* nobody showed — honest nudge */}
        {outcome === "nobody-showed" && (
          <div
            className="shadow-brutal-sm"
            style={{
              borderRadius: 14,
              border: `2px solid ${t.border}`,
              background: t.bgAlt,
              padding: 16,
            }}
          >
            <div
              className="mb-1"
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 15,
                color: t.text,
              }}
            >
              no winner, no loser
            </div>
            <div
              style={{
                fontFamily: t.fontBody,
                fontSize: 14,
                color: t.text,
                lineHeight: 1.5,
              }}
            >
              stakes don&apos;t activate when nobody hits the target. consider it a mulligan. maybe lower the bar next time, or raise the stakes.
            </div>
          </div>
        )}

        {/* circle summary */}
        <div
          style={{
            borderRadius: 12,
            border: `2px solid ${t.border}20`,
            background: t.bgAlt,
            padding: "12px 16px",
          }}
        >
          <div className="flex gap-2 flex-wrap mb-2">
            <Pill color={t.primaryLight}>{habit}</Pill>
            <Pill color={t.bgAlt}>{durationWeeks} weeks</Pill>
          </div>
          <div
            style={{
              fontFamily: t.fontBody,
              fontSize: 13,
              color: t.textMuted,
            }}
          >
            this circle is now in your track record.
          </div>
        </div>

        <div className="h-2" />
      </div>

      {/* share card — rendered off-screen, captured as image */}
      <div
        ref={shareCardRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: -9999,
          top: 0,
          width: 390,
          padding: 24,
          background: t.bg,
          fontFamily: t.fontBody,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: t.font, fontWeight: 700, fontSize: 14, color: t.textMuted, marginBottom: 4 }}>
            smoll bets
          </div>
          <div style={{ fontFamily: t.font, fontWeight: 700, fontSize: 22, color: t.text, lineHeight: 1.1 }}>
            {circleName}
          </div>
          <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
            {habit} &middot; {durationWeeks} weeks
          </div>
        </div>
        <div
          style={{
            borderRadius: 12,
            border: `2px solid ${t.border}`,
            background: OUTCOME_HEADER[outcome].bg,
            padding: "16px 20px",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 4 }}>{OUTCOME_HEADER[outcome].icon}</div>
          <div style={{ fontFamily: t.font, fontWeight: 700, fontSize: 18, color: t.text }}>
            {OUTCOME_HEADER[outcome].title}
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          {results.map((r, i) => (
            <div key={r.user_id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
              <span style={{ fontFamily: t.font, fontWeight: 700, fontSize: 14, width: 20, color: t.text }}>{i + 1}.</span>
              <span style={{ fontFamily: t.font, fontWeight: 700, fontSize: 14, flex: 1, color: t.text }}>{r.display_name}</span>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: r.won ? t.positive : t.danger,
                background: r.won ? t.positiveBg : t.danger + "22",
                padding: "2px 8px",
                borderRadius: 6,
              }}>
                {r.total_logs}/{winTarget} {r.won ? "✓" : "✗"}
              </span>
            </div>
          ))}
        </div>
        {outcome === "someone-owes" && losers.length > 0 && (
          <div style={{ fontSize: 13, color: t.text, background: t.primaryBg, borderRadius: 8, padding: "8px 12px" }}>
            {losers.map((l) => l.display_name.split(" ")[0].toLowerCase()).join(" & ")} owe: {stakes}
          </div>
        )}
        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 12, textAlign: "center" }}>
          smollbets.app
        </div>
      </div>

      {/* docked bottom */}
      <div className="px-5 pb-6 pt-3 shrink-0 flex flex-col gap-2">
        <BigButton
          bg={t.positive}
          loading={sharing}
          onClick={async () => {
            if (!shareCardRef.current) return;
            setSharing(true);
            try {
              const html2canvas = (await import("html2canvas")).default;
              const canvas = await html2canvas(shareCardRef.current, {
                scale: 2,
                backgroundColor: t.bg,
                useCORS: true,
              });
              canvas.toBlob(async (blob) => {
                if (!blob) { setSharing(false); return; }
                const file = new File([blob], `smollbets-${circleName}.png`, { type: "image/png" });
                if (navigator.share && navigator.canShare?.({ files: [file] })) {
                  await navigator.share({
                    title: `${circleName} — smoll bets`,
                    text: `${OUTCOME_HEADER[outcome].title} ${habit}, ${durationWeeks} weeks.`,
                    files: [file],
                  });
                } else {
                  // fallback: download
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `smollbets-${circleName}.png`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
                setSharing(false);
              }, "image/png");
            } catch {
              setSharing(false);
            }
          }}
          className="w-full"
        >
          share results
        </BigButton>
        <BigButton bg={t.primary} onClick={onRunItBack} className="w-full">
          {OUTCOME_CTA[outcome]}
        </BigButton>
        <BigButton bg={t.bgAlt} onClick={onBack} className="w-full">
          back to home
        </BigButton>
      </div>
    </div>
  );
}
