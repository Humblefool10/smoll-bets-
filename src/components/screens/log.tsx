"use client";

import { useState } from "react";
import { t } from "@/lib/tokens";
import { Pill } from "@/components/pill";
import { BigButton } from "@/components/big-button";

import { BackButton } from "@/components/back-button";
import { Confetti } from "@/components/confetti";
import { playChime } from "@/lib/sounds";
import { logHabit } from "@/lib/circles";
import { useCircleDetail } from "@/lib/use-circles";

export function LogScreen({
  circleId,
  onBack,
}: {
  circleId: string | null;
  onBack?: () => void;
}) {
  const { circle } = useCircleDetail(circleId);
  const [state, setState] = useState<"idle" | "done">("idle");
  const [logging, setLogging] = useState(false);

  const circleName = circle?.name ?? "";
  const target = circle?.target ?? 0;

  // Calculate current week number
  function getCurrentWeek(): number {
    if (!circle?.started_at) return 1;
    const start = new Date(circle.started_at);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, diff + 1);
  }

  const handleLog = async (type: "honor" | "photo") => {
    if (!circleId || logging) return;
    setLogging(true);
    try {
      await logHabit({
        circleId,
        type,
        weekNumber: getCurrentWeek(),
      });
      setState("done");
      playChime();
    } catch (err) {
      console.error("failed to log:", err);
    } finally {
      setLogging(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: t.bg }}
    >


      {state === "idle" && (
        <>
          <div className="px-5 pt-2 shrink-0">
            <div className="flex items-center gap-[10px] mb-4">
              <BackButton onClick={onBack} />
              <span
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 18,
                  color: t.text,
                }}
              >
                log today
              </span>
            </div>

            <div
              className="shadow-brutal mb-4"
              style={{
                borderRadius: 14,
                border: `2px solid ${t.border}`,
                background: t.primaryBg,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 13,
                  color: t.textMuted,
                }}
              >
                your circle is watching
              </div>
              <div
                className="mt-1"
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 16,
                  color: t.text,
                }}
              >
                {circleName} · week {getCurrentWeek()}
              </div>
              <div className="flex gap-2 mt-[10px] flex-wrap">
                <Pill color={t.primaryLight}>{circle?.habit ?? ""}</Pill>
                <Pill color={t.bgAlt}>{target}x target</Pill>
              </div>
            </div>
          </div>

          <div className="flex-1 px-5 flex flex-col gap-[14px]">
            <div
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 15,
                color: t.textMuted,
              }}
            >
              how do you want to prove it?
            </div>

            {/* honor log */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleLog("honor")}
              onKeyDown={(e) => e.key === "Enter" && handleLog("honor")}
              className="flex gap-[14px] items-center cursor-pointer shadow-brutal"
              style={{
                borderRadius: 14,
                border: `2px solid ${t.border}`,
                background: t.bgAlt,
                padding: 20,
              }}
            >
              <div
                className="flex items-center justify-center shrink-0 shadow-brutal-sm"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  border: `2px solid ${t.border}`,
                  background: t.primaryLight,
                }}
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 26 26"
                  fill="none"
                  stroke={t.border}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M4 13l6 6L22 7" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: t.font,
                    fontWeight: 700,
                    fontSize: 17,
                    color: t.text,
                  }}
                >
                  honor log
                </div>
                <div
                  className="mt-[2px]"
                  style={{
                    fontFamily: t.fontBody,
                    fontSize: 13,
                    color: t.textMuted,
                  }}
                >
                  your word is your bond. one tap, done.
                </div>
              </div>
            </div>

            {/* photo proof */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleLog("photo")}
              onKeyDown={(e) => e.key === "Enter" && handleLog("photo")}
              className="flex gap-[14px] items-center cursor-pointer shadow-brutal"
              style={{
                borderRadius: 14,
                border: `2px solid ${t.border}`,
                background: t.bgAlt,
                padding: 20,
              }}
            >
              <div
                className="flex items-center justify-center shrink-0 shadow-brutal-sm"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  border: `2px solid ${t.border}`,
                  background: t.accentLight,
                }}
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 26 26"
                  fill="none"
                  stroke={t.border}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <circle cx="13" cy="13" r="9" />
                  <circle cx="13" cy="13" r="4" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: t.font,
                    fontWeight: 700,
                    fontSize: 17,
                    color: t.text,
                  }}
                >
                  photo proof
                </div>
                <div
                  className="mt-[2px]"
                  style={{
                    fontFamily: t.fontBody,
                    fontSize: 13,
                    color: t.textMuted,
                  }}
                >
                  snap it to lock it. no gallery uploads.
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {state === "done" && (
        <div className="flex-1 flex flex-col items-center justify-center px-7 gap-5 text-center">
          <Confetti count={35} />
          <div
            className="flex items-center justify-center shadow-brutal celebrate-pop"
            style={{
              width: 96,
              height: 96,
              borderRadius: 28,
              border: `3px solid ${t.border}`,
              background: t.positive,
            }}
          >
            <svg
              className="check-draw"
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              stroke={t.border}
              strokeWidth="3"
              strokeLinecap="round"
            >
              <path d="M10 24l10 10L38 14" />
            </svg>
          </div>
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
              logged.
            </div>
            <div
              className="mt-2"
              style={{
                fontFamily: t.fontBody,
                fontSize: 16,
                color: t.textMuted,
              }}
            >
              your circle can see this now.
            </div>
          </div>

          <div
            className="w-full shadow-brutal-sm"
            style={{
              borderRadius: 14,
              border: `2px solid ${t.border}`,
              background: t.primaryBg,
              padding: "14px 20px",
            }}
          >
            <div
              style={{
                fontFamily: t.fontBody,
                fontSize: 14,
                color: t.textMuted,
              }}
            >
              {circleName} · week {getCurrentWeek()}
            </div>
            <div
              className="mt-2"
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 14,
                color: t.text,
              }}
            >
              logged successfully.
            </div>
          </div>

          <BigButton
            bg={t.bgAlt}
            onClick={onBack}
            className="w-full"
          >
            back to circle
          </BigButton>
        </div>
      )}
    </div>
  );
}
