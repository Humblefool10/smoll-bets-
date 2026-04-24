"use client";

import { useState } from "react";
import { t } from "@/lib/tokens";
import { Avatar } from "@/components/avatar";
import { Pill } from "@/components/pill";
import { BigButton } from "@/components/big-button";
import { StatusBar } from "@/components/status-bar";

// ── the pulled-in user's journey ────────────────────────────────────────────
//
// anthropology: tribal joining was see → understand → commit.
// psychology: commitment escalation. emotional "yes" comes BEFORE
// the administrative act of signing up. by the time they enter
// their email, the question isn't "should I join?" but "how do I get in?"
//
// flow: preview (no auth) → "i'm in" → auth wall → confirmed → redirect

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "preview" | "auth" | "confirmed";

// simulated circle data — in production, fetched from URL params + Supabase
const circleData = {
  name: "gym rats",
  habit: "run 3x per week",
  duration: "4 weeks",
  stakes: "cook dinner for the group",
  verification: "proof",
  inviter: "Maya P",
  members: [
    { name: "Maya P", label: "created the circle" },
    { name: "Jordan K", label: "joined 1h ago" },
    { name: "Sam T", label: "joined 30m ago" },
  ],
  spotsLeft: 3,
};

export default function InvitePage() {
  const [step, setStep] = useState<Step>("preview");
  const [email, setEmail] = useState("");

  return (
    <div className="h-full w-full max-w-[430px] mx-auto relative overflow-hidden">
      <div className="flex flex-col h-full" style={{ background: t.bg }}>
        <StatusBar />

        {/* ── step 1: preview ─────────────────────────────────────
            no auth required. the user sees everything about the bet
            before being asked for anything. social proof + stakes
            visible. the "i'm in" button is the emotional commitment. */}
        {step === "preview" && (
          <div className="flex-1 overflow-y-auto px-5 pt-2 flex flex-col gap-4">
            {/* who invited you — social trust anchor */}
            <div className="flex items-center gap-3">
              <Avatar name={circleData.inviter} size={36} color={t.primaryLight} />
              <div>
                <div
                  style={{
                    fontFamily: t.fontBody,
                    fontSize: 14,
                    color: t.textMuted,
                  }}
                >
                  {circleData.inviter.toLowerCase()} invited you to
                </div>
              </div>
            </div>

            {/* the bet card — this is what they're joining */}
            <div
              className="shadow-brutal"
              style={{
                borderRadius: 16,
                border: `2px solid ${t.border}`,
                background: t.primaryBg,
                padding: 20,
              }}
            >
              <div
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 26,
                  color: t.text,
                  lineHeight: 1.1,
                  marginBottom: 10,
                }}
              >
                {circleData.name}
              </div>

              <div className="flex gap-2 flex-wrap mb-4">
                <Pill color={t.primaryLight}>{circleData.habit}</Pill>
                <Pill color={t.bgAlt}>{circleData.duration}</Pill>
              </div>

              {/* the stakes — the emotional core. bigger text, own section. */}
              <div
                style={{
                  borderRadius: 10,
                  border: `2px solid ${t.border}`,
                  background: t.danger + "15",
                  padding: "12px 14px",
                  boxShadow: t.shadowSm,
                  marginBottom: 4,
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
                    fontFamily: t.font,
                    fontWeight: 700,
                    fontSize: 16,
                    color: t.text,
                  }}
                >
                  loser {circleData.stakes}.
                </div>
              </div>
            </div>

            {/* who's already in — social proof / bandwagon */}
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
                who&apos;s in ({circleData.members.length} people, {circleData.spotsLeft} spots left)
              </div>

              <div
                style={{
                  borderRadius: 12,
                  border: `2px solid ${t.border}`,
                  background: t.bg,
                  boxShadow: t.shadowSm,
                  overflow: "hidden",
                }}
              >
                {circleData.members.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3"
                    style={{
                      padding: "10px 14px",
                      borderBottom:
                        i < circleData.members.length - 1
                          ? `1px solid ${t.border}15`
                          : "none",
                    }}
                  >
                    <Avatar name={m.name} size={36} />
                    <div className="flex-1">
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
                    </div>
                    <span
                      style={{
                        fontFamily: t.fontBody,
                        fontSize: 12,
                        color: t.textMuted,
                      }}
                    >
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* verification mode — sets expectations */}
            <div
              style={{
                borderRadius: 10,
                border: `2px solid ${t.border}`,
                background: t.bgAlt,
                padding: "10px 14px",
                boxShadow: t.shadowSm,
              }}
            >
              <div
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 13,
                  color: t.textMuted,
                }}
              >
                {circleData.verification === "proof"
                  ? "📸 photo proof required. snap it to lock it."
                  : "🤝 honor system. your word is your bond."}
              </div>
            </div>

            {/* weight copy — this isn't a casual action */}
            <div
              className="text-center"
              style={{
                fontFamily: t.fontBody,
                fontSize: 13,
                color: t.textMuted,
                padding: "0 20px",
              }}
            >
              this is a commitment, not a like. if you join, your circle
              will see whether you show up.
            </div>

            <div className="h-24" />
          </div>
        )}

        {/* ── step 2: auth ────────────────────────────────────────
            they tapped "i'm in." the emotional commitment is made.
            now auth is a formality, not a gate. the framing is
            "almost there" not "create an account." */}
        {step === "auth" && (
          <div className="flex-1 px-5 pt-4 flex flex-col">
            {/* context bar — remind them what they're joining */}
            <div
              className="flex items-center gap-3 mb-6 shadow-brutal-sm"
              style={{
                borderRadius: 10,
                border: `2px solid ${t.border}`,
                background: t.positiveBg,
                padding: "10px 14px",
              }}
            >
              <span style={{ fontSize: 18 }}>✓</span>
              <div>
                <div
                  style={{
                    fontFamily: t.font,
                    fontWeight: 700,
                    fontSize: 14,
                    color: t.text,
                  }}
                >
                  you&apos;re joining {circleData.name}
                </div>
                <div
                  style={{
                    fontFamily: t.fontBody,
                    fontSize: 12,
                    color: t.textMuted,
                  }}
                >
                  just need to know who you are
                </div>
              </div>
            </div>

            <div
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 24,
                color: t.text,
                lineHeight: 1.1,
                marginBottom: 4,
              }}
            >
              almost there
            </div>
            <div
              className="mb-6"
              style={{
                fontFamily: t.fontBody,
                fontSize: 14,
                color: t.textMuted,
              }}
            >
              sign in so your circle knows who you are.
            </div>

            <div className="flex flex-col gap-4">
              {/* email */}
              <div>
                <label
                  style={{
                    fontFamily: t.fontBody,
                    fontSize: 13,
                    color: t.textMuted,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && EMAIL_RE.test(email)) {
                      setStep("confirmed");
                    }
                  }}
                  maxLength={254}
                  autoComplete="email"
                  className="w-full outline-none"
                  style={{
                    fontFamily: t.fontBody,
                    fontSize: 16,
                    color: t.text,
                    background: t.bgAlt,
                    border: `2px solid ${t.border}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    boxShadow: t.shadowSm,
                  }}
                />
              </div>

              <BigButton
                onClick={() => {
                  if (EMAIL_RE.test(email)) setStep("confirmed");
                }}
              >
                send magic link
              </BigButton>

              {/* divider */}
              <div className="flex items-center gap-3 my-1">
                <div
                  className="flex-1 h-[2px]"
                  style={{ background: t.border + "22" }}
                />
                <span
                  style={{
                    fontFamily: t.fontBody,
                    fontSize: 13,
                    color: t.textMuted,
                  }}
                >
                  or
                </span>
                <div
                  className="flex-1 h-[2px]"
                  style={{ background: t.border + "22" }}
                />
              </div>

              <BigButton bg={t.bgAlt} onClick={() => setStep("confirmed")}>
                <span className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  continue with google
                </span>
              </BigButton>
            </div>
          </div>
        )}

        {/* ── step 3: confirmed ───────────────────────────────────
            peak-end rule: this is the END of the journey.
            it must feel triumphant. "bet accepted. no going back."
            then redirect to the circle. */}
        {step === "confirmed" && (
          <div className="flex-1 flex flex-col items-center justify-center px-7 gap-5 text-center">
            {/* big checkmark — the triumph moment */}
            <div
              className="flex items-center justify-center shadow-brutal"
              style={{
                width: 96,
                height: 96,
                borderRadius: 28,
                border: `3px solid ${t.border}`,
                background: t.positive,
              }}
            >
              <svg
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
                  fontSize: 26,
                  color: t.text,
                  lineHeight: 1.1,
                }}
              >
                bet accepted.
              </div>
              <div
                className="mt-1"
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 26,
                  color: t.text,
                  lineHeight: 1.1,
                }}
              >
                no going back.
              </div>
            </div>

            <div
              style={{
                fontFamily: t.fontBody,
                fontSize: 15,
                color: t.textMuted,
              }}
            >
              you&apos;re in {circleData.name}. the circle is watching.
            </div>

            {/* what you committed to — reinforce the contract */}
            <div
              className="w-full shadow-brutal-sm"
              style={{
                borderRadius: 14,
                border: `2px solid ${t.border}`,
                background: t.primaryBg,
                padding: "14px 16px",
              }}
            >
              <div className="flex gap-2 flex-wrap mb-2">
                <Pill color={t.primaryLight}>{circleData.habit}</Pill>
                <Pill color={t.bgAlt}>{circleData.duration}</Pill>
              </div>
              <div
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 14,
                  color: t.text,
                  fontWeight: 500,
                }}
              >
                loser {circleData.stakes}.
              </div>
            </div>

            {/* who else is in */}
            <div className="flex items-center gap-1">
              {circleData.members.map((m, i) => (
                <div
                  key={i}
                  style={{
                    marginLeft: i === 0 ? 0 : -8,
                    zIndex: circleData.members.length - i,
                  }}
                >
                  <Avatar name={m.name} size={32} />
                </div>
              ))}
              <div
                style={{
                  marginLeft: -8,
                  zIndex: 0,
                }}
              >
                <Avatar name="You" size={32} color={t.positive} />
              </div>
              <span
                className="ml-2"
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 13,
                  color: t.textMuted,
                }}
              >
                + you
              </span>
            </div>

            <BigButton
              onClick={() => (window.location.href = "/")}
              className="w-full"
            >
              go to my circles
            </BigButton>

            <div
              style={{
                fontFamily: t.fontBody,
                fontSize: 12,
                color: t.textMuted,
              }}
            >
              we&apos;ll remind you when it starts.
            </div>
          </div>
        )}

        {/* floating "i'm in" button — only on preview step.
            this is the emotional commitment moment.
            it sits at the bottom, always visible, impossible to miss. */}
        {step === "preview" && (
          <div className="absolute bottom-6 left-5 right-5">
            <BigButton
              bg={t.primary}
              onClick={() => setStep("auth")}
              className="w-full"
            >
              i&apos;m in
            </BigButton>
          </div>
        )}
      </div>
    </div>
  );
}
