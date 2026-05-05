"use client";

import { useState, useEffect } from "react";
import { t } from "@/lib/tokens";
import { Avatar } from "@/components/avatar";
import { Pill } from "@/components/pill";
import { BigButton } from "@/components/big-button";

export function SplashScreen({
  onContinue,
  onSignIn,
}: {
  onContinue: () => void;
  onSignIn?: () => void;
}) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 900),
      setTimeout(() => setPhase(4), 1300),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const fade = (step: number) => ({
    opacity: phase >= step ? 1 : 0,
    transform: phase >= step ? "translateY(0)" : "translateY(12px)",
    transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
  });

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: t.bg }}
    >
      <div className="flex-1 px-6 pt-12 pb-6 flex flex-col">
        {/* logo + name */}
        <div className="flex items-center gap-3 mb-1" style={fade(1)}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: `2px solid ${t.border}`,
              background: t.primary,
              boxShadow: t.shadowSm,
            }}
          >
            <span
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 18,
                color: t.text,
              }}
            >
              sb
            </span>
          </div>
          <h1
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 26,
              color: t.text,
              letterSpacing: -0.5,
            }}
          >
            smoll bets
          </h1>
        </div>

        <div className="mb-5" style={fade(1)}>
          <div
            style={{
              fontFamily: t.fontBody,
              fontSize: 15,
              color: t.textMuted,
              lineHeight: 1.4,
            }}
          >
            challenge your friends. build habits together. loser pays up.
          </div>
        </div>

        {/* the product shown as a compact circle card */}
        <div style={fade(2)}>
          <div
            className="shadow-brutal"
            style={{
              borderRadius: 14,
              border: `2px solid ${t.border}`,
              background: t.primaryBg,
              padding: 14,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 20,
                  color: t.text,
                }}
              >
                gym rats
              </div>
              <Pill color={t.bgAlt}>4 weeks</Pill>
            </div>
            <div className="flex gap-2 flex-wrap mb-2">
              <Pill color={t.primaryLight}>run 3x per week</Pill>
              <Pill color={t.danger + "22"}>loser cooks dinner</Pill>
            </div>
            <div className="flex items-center gap-1">
              {["Maya P", "Jordan K", "Sam T"].map((name, i) => (
                <div
                  key={name}
                  style={{
                    marginLeft: i === 0 ? 0 : -8,
                    zIndex: 3 - i,
                  }}
                >
                  <Avatar name={name} size={26} />
                </div>
              ))}
              <span
                className="ml-2"
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 12,
                  color: t.textMuted,
                }}
              >
                3 in · 3 spots left
              </span>
            </div>
          </div>
        </div>

        {/* how it works — compact, single lines */}
        <div className="mt-5" style={fade(3)}>
          <div
            className="mb-2"
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 14,
              color: t.textMuted,
            }}
          >
            how it works
          </div>

          {[
            { icon: "🎯", text: "pick a habit, set the stakes" },
            { icon: "📲", text: "invite your people with a link" },
            { icon: "👀", text: "track progress, roast the slackers" },
            { icon: "🍳", text: "losers pay up, winners collect" },
          ].map((step) => (
            <div
              key={step.text}
              className="flex items-center gap-3"
              style={{ padding: "6px 0" }}
            >
              <span style={{ fontSize: 16 }}>{step.icon}</span>
              <span
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 14,
                  color: t.text,
                  fontWeight: 500,
                }}
              >
                {step.text}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        {/* CTA */}
        <div className="mt-4" style={fade(4)}>
          <BigButton onClick={onContinue} className="w-full">
            start a circle
          </BigButton>
          <button
            type="button"
            onClick={onSignIn ?? onContinue}
            className="w-full text-center mt-3 cursor-pointer"
            style={{
              background: "transparent",
              border: "none",
              fontFamily: t.fontBody,
              fontSize: 14,
              color: t.text,
              fontWeight: 500,
              textDecoration: "underline",
              textUnderlineOffset: 3,
              textDecorationColor: t.textMuted,
            }}
          >
            been here before? sign in
          </button>
          <div
            className="text-center mt-3"
            style={{
              fontFamily: t.fontBody,
              fontSize: 12,
              color: t.textMuted,
            }}
          >
            free. works in your browser. no app download.
          </div>
        </div>
      </div>
    </div>
  );
}
