"use client";

import { useState } from "react";
import { t } from "@/lib/tokens";
import { BigButton } from "@/components/big-button";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthScreen({
  onAuth,
  onSignInWithEmail,
  onSignInWithGoogle,
}: {
  onAuth: () => void;
  onSignInWithEmail: (email: string) => Promise<{ error: Error | null }>;
  onSignInWithGoogle: () => Promise<{ error: Error | null }>;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleMagicLink = async () => {
    if (!EMAIL_RE.test(email)) {
      setError("that doesn't look like an email. try again?");
      return;
    }
    setError("");
    setSending(true);

    const { error: authError } = await onSignInWithEmail(email);

    if (authError) {
      setError(authError.message);
      setSending(false);
      return;
    }

    setSending(false);
    setSent(true);
    // user will click the magic link in their email,
    // which redirects back to the app. the auth state
    // listener in useAuth picks it up and onAuth fires.
  };

  const handleGoogle = async () => {
    const { error: authError } = await onSignInWithGoogle();
    if (authError) {
      setError(authError.message);
    }
    // google auth redirects away from the app entirely.
    // when it redirects back, useAuth picks up the session.
  };

  return (
    <div
      className="flex flex-col h-full px-6"
      style={{ background: t.bg }}
    >
      <div className="pt-14 pb-4">
        <div
          style={{
            fontFamily: t.font,
            fontWeight: 700,
            fontSize: 28,
            color: t.text,
            lineHeight: 1.1,
          }}
        >
          jump in
        </div>
        <div
          className="mt-2"
          style={{
            fontFamily: t.fontBody,
            fontSize: 15,
            color: t.textMuted,
          }}
        >
          sign in with google, or we&apos;ll send you a magic link.
        </div>
      </div>

      {!sent ? (
        <div className="flex flex-col gap-4 mt-4">
          <BigButton onClick={handleGoogle}>
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

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-[2px]" style={{ background: t.border + "22" }} />
            <span
              style={{
                fontFamily: t.fontBody,
                fontSize: 13,
                color: t.textMuted,
              }}
            >
              or
            </span>
            <div className="flex-1 h-[2px]" style={{ background: t.border + "22" }} />
          </div>

          <div>
            <label
              htmlFor="auth-email"
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
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder="you@email.com"
              onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
              maxLength={254}
              autoComplete="email"
              aria-invalid={!!error}
              aria-describedby={error ? "auth-email-error" : undefined}
              className="w-full outline-none"
              style={{
                fontFamily: t.fontBody,
                fontSize: 16,
                color: t.text,
                background: t.bgAlt,
                border: `2px solid ${error ? t.danger : t.border}`,
                borderRadius: 12,
                padding: "14px 16px",
                boxShadow: t.shadowSm,
              }}
            />
            {error && (
              <div
                id="auth-email-error"
                role="alert"
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 13,
                  color: t.danger,
                  marginTop: 6,
                }}
              >
                {error}
              </div>
            )}
          </div>

          <BigButton bg={t.bgAlt} onClick={handleMagicLink} loading={sending}>
            send magic link
          </BigButton>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center">
          <div
            className="flex items-center justify-center"
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              border: `3px solid ${t.border}`,
              background: t.positive,
              boxShadow: t.shadow,
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              stroke={t.border}
              strokeWidth="3"
              strokeLinecap="round"
            >
              <path d="M8 18l7 7L28 11" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 22,
                color: t.text,
              }}
            >
              check your inbox
            </div>
            <div
              className="mt-2"
              style={{
                fontFamily: t.fontBody,
                fontSize: 14,
                color: t.textMuted,
              }}
            >
              we sent a link to {email}. tap it and you&apos;re in.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
