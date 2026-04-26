"use client";

import { useState, useEffect, useRef, use } from "react";
import { t } from "@/lib/tokens";
import { Avatar } from "@/components/avatar";
import { Pill } from "@/components/pill";
import { BigButton } from "@/components/big-button";

import { Confetti } from "@/components/confetti";
import { playStamp, playCelebrate } from "@/lib/sounds";
import { LoadingScreen } from "@/components/loading";
import { ErrorState } from "@/components/error-state";
import { Dialog } from "@/components/dialog";
import { fetchCircleByInvite, joinCircle } from "@/lib/circles";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/lib/supabase";

type Step = "preview" | "auth" | "joining" | "confirmed";

interface CircleData {
  id: string;
  name: string;
  habit: string;
  duration_weeks: number;
  stakes: string;
  verification: "honor" | "proof";
  max_members: number;
  status: string;
  members: { name: string; label: string }[];
  spotsLeft: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { user, loading: authLoading, signInWithEmail, signInWithGoogle } = useAuth();

  const [circleData, setCircleData] = useState<CircleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("preview");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [dialog, setDialog] = useState<{
    title: string;
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const celebratedRef = useRef(false);
  const joinedRef = useRef(false);

  // fetch circle data by invite code
  useEffect(() => {
    async function load() {
      const data = await fetchCircleByInvite(code);
      if (!data) {
        setError("notFound");
        setLoading(false);
        return;
      }

      if (data.status === "completed") {
        setError("expired");
        setLoading(false);
        return;
      }

      const members = (data.circle_members || [])
        .filter((m: { left_at?: string | null }) => !m.left_at)
        .map((m: { role: string; profile?: { display_name?: string } }) => ({
          name: m.profile?.display_name || "unknown",
          label: m.role === "creator" ? "created the circle" : "joined",
        }));

      const spotsLeft = data.max_members - members.length;

      if (spotsLeft <= 0) {
        setError("full");
        setLoading(false);
        return;
      }

      setCircleData({
        id: data.id,
        name: data.name,
        habit: data.habit,
        duration_weeks: data.duration_weeks,
        stakes: data.stakes,
        verification: data.verification,
        max_members: data.max_members,
        status: data.status,
        members,
        spotsLeft,
      });
      setLoading(false);
    }
    load();
  }, [code]);

  // when user + circle data are both available, check membership and auto-join if needed
  useEffect(() => {
    if (!user || !circleData || joinedRef.current) return;

    async function checkAndJoin() {
      // check if already a member
      const { data } = await supabase
        .from("circle_members")
        .select("id")
        .eq("circle_id", circleData!.id)
        .eq("user_id", user!.id)
        .is("left_at", null)
        .maybeSingle();

      if (data) {
        setAlreadyMember(true);
        return;
      }

      // user is authenticated but not a member — they came from a magic link
      // or google redirect. auto-join without making them tap again.
      const pending = localStorage.getItem("pendingInvite");
      if (pending === code || step === "auth" || step === "joining") {
        localStorage.removeItem("pendingInvite");
        handleJoin();
      }
    }
    checkAndJoin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, circleData]);

  useEffect(() => {
    if (step === "confirmed" && !celebratedRef.current) {
      celebratedRef.current = true;
      playCelebrate();
    }
  }, [step]);

  async function handleJoin() {
    if (!circleData || joinedRef.current) return;
    joinedRef.current = true;
    setStep("joining");
    try {
      await joinCircle(circleData.id);
      setStep("confirmed");
    } catch (err) {
      console.error("failed to join:", err);
      joinedRef.current = false;
      setStep("preview");
    }
  }

  async function handleImIn() {
    playStamp();
    if (user) {
      if (alreadyMember) {
        window.location.href = "/";
        return;
      }
      await handleJoin();
    } else {
      setStep("auth");
    }
  }

  async function handleSendMagicLink() {
    if (sending) return;
    if (!EMAIL_RE.test(email.trim())) {
      setDialog({
        title: "that email looks off",
        message: "double check it, then try again.",
        variant: "error",
      });
      return;
    }
    setSending(true);
    localStorage.setItem("pendingInvite", code);
    const redirectTo = `${window.location.origin}/invite/${code}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    setSending(false);
    if (error) {
      console.error("auth error:", error);
      setDialog({
        title: "couldn't send the link",
        message: error.message || "something broke on our end. try again in a sec.",
        variant: "error",
      });
      return;
    }
    setEmailSent(true);
    setDialog({
      title: "magic link sent",
      message: `check ${email.trim()}. tap the link and you're in.`,
      variant: "success",
    });
  }

  async function handleGoogleSignIn() {
    // Store invite code so we can rejoin after redirect
    localStorage.setItem("pendingInvite", code);
    const redirectTo = `${window.location.origin}/invite/${code}`;
    await signInWithGoogle(redirectTo);
  }

  if (loading || authLoading) {
    return (
      <div className="h-full w-full max-w-[430px] mx-auto relative overflow-hidden">
        <LoadingScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full max-w-[430px] mx-auto relative overflow-hidden">
        <div className="flex flex-col h-full items-center justify-center px-6" style={{ background: t.bg }}>
          <ErrorState
            type={error === "notFound" ? "notFound" : error === "expired" ? "expired" : error === "full" ? "full" : "generic"}
            onAction={() => window.location.reload()}
          />
          <BigButton
            bg={t.bgAlt}
            onClick={() => { window.location.href = "/"; }}
            className="w-full mt-4"
          >
            go home
          </BigButton>
        </div>
      </div>
    );
  }

  if (!circleData) return null;

  return (
    <div className="h-full w-full max-w-[430px] mx-auto relative overflow-hidden">
      <div className="flex flex-col h-full" style={{ background: t.bg }}>

        {/* nav header — escape hatch back to home/splash */}
        {step === "preview" && (
          <div className="shrink-0 px-5 pt-6 pb-4">
            <button
              type="button"
              onClick={() => { window.location.href = "/"; }}
              aria-label="go to smoll bets home"
              className="flex items-center gap-[10px] cursor-pointer"
              style={{ background: "transparent", border: "none", padding: 0 }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  border: `2px solid ${t.border}`,
                  background: t.primary,
                  boxShadow: t.shadowSm,
                }}
              >
                <span
                  style={{
                    fontFamily: t.font,
                    fontWeight: 700,
                    fontSize: 14,
                    color: t.text,
                  }}
                >
                  sb
                </span>
              </div>
              <span
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 18,
                  color: t.text,
                  letterSpacing: -0.3,
                }}
              >
                smoll bets
              </span>
            </button>
          </div>
        )}

        {/* step 1: preview */}
        {step === "preview" && (
          <div className="flex-1 overflow-y-auto px-5 pt-2 flex flex-col gap-4">
            {/* who invited you */}
            <div className="flex items-center gap-3">
              <Avatar
                name={circleData.members[0]?.name || "?"}
                size={36}
                color={t.primaryLight}
              />
              <div
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 14,
                  color: t.textMuted,
                }}
              >
                {(circleData.members[0]?.name || "someone").toLowerCase()} invited you to
              </div>
            </div>

            {/* the bet card */}
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
                <Pill color={t.bgAlt}>{circleData.duration_weeks} weeks</Pill>
              </div>

              {/* the stakes */}
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

            {/* who's already in */}
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
                who&apos;s in ({circleData.members.length} {circleData.members.length === 1 ? "person" : "people"}, {circleData.spotsLeft} {circleData.spotsLeft === 1 ? "spot" : "spots"} left)
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

            {/* verification mode */}
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
                  ? "photo proof required. snap it to lock it."
                  : "honor system. your word is your bond."}
              </div>
            </div>

            {/* weight copy */}
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
          </div>
        )}

        {/* docked "i'm in" button — preview step */}
        {step === "preview" && (
          <div className="px-5 pb-6 pt-3 shrink-0">
            {alreadyMember ? (
              <BigButton
                bg={t.positive}
                onClick={() => { window.location.href = "/"; }}
                className="w-full"
              >
                you&apos;re already in. go to circles
              </BigButton>
            ) : (
              <BigButton
                bg={t.primary}
                onClick={handleImIn}
                className="w-full"
              >
                i&apos;m in
              </BigButton>
            )}
          </div>
        )}

        {/* step 2: auth */}
        {step === "auth" && (
          <div className="flex-1 px-5 pt-4 flex flex-col">
            {/* context bar */}
            <div
              className="flex items-center gap-3 mb-6 shadow-brutal-sm"
              style={{
                borderRadius: 10,
                border: `2px solid ${t.border}`,
                background: t.positiveBg,
                padding: "10px 14px",
              }}
            >
              <span style={{ fontSize: 18 }}>&#10003;</span>
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
              <BigButton bg={t.bgAlt} onClick={handleGoogleSignIn}>
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

              {emailSent ? (
                <div
                  className="shadow-brutal-sm text-center"
                  style={{
                    borderRadius: 14,
                    border: `2px solid ${t.border}`,
                    background: t.positiveBg,
                    padding: 20,
                  }}
                >
                  <div
                    style={{
                      fontFamily: t.font,
                      fontWeight: 700,
                      fontSize: 18,
                      color: t.text,
                      marginBottom: 6,
                    }}
                  >
                    check your email
                  </div>
                  <div
                    style={{
                      fontFamily: t.fontBody,
                      fontSize: 14,
                      color: t.textMuted,
                    }}
                  >
                    we sent a magic link to {email}. click it and you&apos;re in.
                  </div>
                </div>
              ) : (
                <>
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
                        if (e.key === "Enter") handleSendMagicLink();
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

                  <BigButton bg={t.bgAlt} onClick={handleSendMagicLink} disabled={sending}>
                    {sending ? "sending..." : "send magic link"}
                  </BigButton>
                </>
              )}
            </div>
          </div>
        )}

        {/* step: joining (loading) */}
        {step === "joining" && (
          <div className="flex-1 flex items-center justify-center">
            <LoadingScreen />
          </div>
        )}

        {/* step 3: confirmed */}
        {step === "confirmed" && (
          <div className="flex-1 flex flex-col items-center justify-center px-7 gap-5 text-center">
            <Confetti count={50} />
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

            {/* what you committed to */}
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
                <Pill color={t.bgAlt}>{circleData.duration_weeks} weeks</Pill>
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
              <div style={{ marginLeft: -8, zIndex: 0 }}>
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
              onClick={() => { window.location.href = "/"; }}
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

      </div>

      <Dialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        title={dialog?.title || ""}
        message={dialog?.message || ""}
        variant={dialog?.variant || "success"}
      />
    </div>
  );
}
