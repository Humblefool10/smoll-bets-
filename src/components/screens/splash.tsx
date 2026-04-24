"use client";

import { useState, useEffect } from "react";
import { t } from "@/lib/tokens";
import { BigButton } from "@/components/big-button";

export function SplashScreen({ onContinue }: { onContinue: () => void }) {
  const [show, setShow] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 100);
    const t2 = setTimeout(() => setShowTagline(true), 600);
    const t3 = setTimeout(() => setShowButton(true), 1100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-8"
      style={{ background: t.bg }}
    >
      {/* logo mark */}
      <div
        className="flex items-center justify-center mb-6"
        style={{
          width: 96,
          height: 96,
          borderRadius: 28,
          border: `3px solid ${t.border}`,
          background: t.primary,
          boxShadow: t.shadow,
          opacity: show ? 1 : 0,
          transform: show ? "scale(1)" : "scale(0.8)",
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <span
          style={{
            fontFamily: t.font,
            fontWeight: 700,
            fontSize: 42,
            color: t.text,
          }}
        >
          sb
        </span>
      </div>

      {/* wordmark */}
      <div
        style={{
          fontFamily: t.font,
          fontWeight: 700,
          fontSize: 36,
          color: t.text,
          letterSpacing: -0.5,
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.5s ease 0.2s",
        }}
      >
        smoll bets
      </div>

      {/* tagline */}
      <div
        className="text-center mt-3 max-w-[260px]"
        style={{
          fontFamily: t.fontBody,
          fontSize: 16,
          color: t.textMuted,
          lineHeight: 1.5,
          opacity: showTagline ? 1 : 0,
          transform: showTagline ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.5s ease",
        }}
      >
        make a bet with your people. build the habit, or pay up.
      </div>

      {/* value props */}
      <div
        className="flex flex-col gap-3 mt-10 w-full max-w-[300px]"
        style={{
          opacity: showTagline ? 1 : 0,
          transform: showTagline ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.5s ease 0.2s",
        }}
      >
        {[
          { emoji: "🤝", text: "bet with friends, not an app" },
          { emoji: "🏆", text: "loser pays up, winner collects" },
          { emoji: "👀", text: "your circle is always watching" },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: t.bgAlt,
              border: `2px solid ${t.border}`,
              boxShadow: t.shadowSm,
            }}
          >
            <span style={{ fontSize: 20 }}>{item.emoji}</span>
            <span
              style={{
                fontFamily: t.fontBody,
                fontSize: 14,
                fontWeight: 500,
                color: t.text,
              }}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        className="w-full max-w-[300px] mt-10"
        style={{
          opacity: showButton ? 1 : 0,
          transform: showButton ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.5s ease",
        }}
      >
        <BigButton onClick={onContinue} className="w-full">
          let&apos;s go
        </BigButton>
        <div
          className="text-center mt-3"
          style={{
            fontFamily: t.fontBody,
            fontSize: 12,
            color: t.textMuted,
          }}
        >
          no download needed. works in your browser.
        </div>
      </div>
    </div>
  );
}
