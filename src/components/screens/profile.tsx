"use client";

import { useState, useEffect, useCallback } from "react";
import { t } from "@/lib/tokens";
import { Avatar } from "@/components/avatar";
import { Pill } from "@/components/pill";
import { BigButton } from "@/components/big-button";

import { BackButton } from "@/components/back-button";
import { SkeletonBar, SkeletonCircle, LoadingText } from "@/components/loading";
import { EmptyState } from "@/components/empty-state";
import { useProfile } from "@/lib/use-profile";
import { useAuth } from "@/lib/use-auth";
import { fetchProfileStats, fetchBetHistory } from "@/lib/circles";
import type { ProfileStats, BetHistoryItem } from "@/lib/circles";
import { deleteAccount, submitFeedback, isValidEmail } from "@/lib/account";
import { useModalA11y } from "@/lib/use-modal-a11y";

const FEEDBACK_MAX = 4000;

function SkeletonProfileContent() {
  return (
    <>
      {/* identity card skeleton */}
      <div
        className="flex items-center gap-4"
        style={{
          borderRadius: 14,
          border: `2px solid ${t.border}20`,
          background: t.bgAlt,
          padding: 16,
        }}
      >
        <SkeletonCircle size={56} />
        <div className="flex flex-col gap-2">
          <SkeletonBar width={120} height={20} />
          <SkeletonBar width={90} height={13} />
        </div>
      </div>

      {/* stats skeleton */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="text-center"
            style={{
              borderRadius: 10,
              border: `2px solid ${t.border}20`,
              background: t.bgAlt,
              padding: "10px 4px",
            }}
          >
            <SkeletonBar width={30} height={18} />
            <div className="mt-2">
              <SkeletonBar width={40} height={11} />
            </div>
          </div>
        ))}
      </div>

      {/* IOUs skeleton */}
      <div className="mt-4">
        <SkeletonBar width={80} height={15} />
        <div className="mt-2 flex flex-col gap-2">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-3" style={{ padding: "12px 0" }}>
              <SkeletonCircle size={32} />
              <div className="flex-1 flex flex-col gap-2">
                <SkeletonBar width={140} height={14} />
                <SkeletonBar width={100} height={12} />
              </div>
              <SkeletonBar width={60} height={20} radius={8} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function ProfileScreen({
  onBack,
  onSignOut,
}: {
  onBack?: () => void;
  onSignOut?: () => void;
}) {
  const { profile, loading: profileLoading } = useProfile();
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({ total: 0, active: 0, won: 0, lost: 0 });
  const [betHistory, setBetHistory] = useState<BetHistoryItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // feedback modal state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const loading = profileLoading || dataLoading;

  const closeDelete = useCallback(() => {
    if (!deleting) {
      setDeleteOpen(false);
      setDeleteError(null);
    }
  }, [deleting]);
  const deleteRef = useModalA11y(deleteOpen, closeDelete);

  const closeFeedback = useCallback(() => {
    if (!feedbackSending) {
      setFeedbackOpen(false);
      setFeedbackError(null);
      setFeedbackSent(false);
    }
  }, [feedbackSending]);
  const feedbackRef = useModalA11y(feedbackOpen, closeFeedback);

  // prefill the email field when the modal opens, from the current verified
  // auth email. user can edit it if they want a different reply-to.
  const openFeedback = () => {
    setFeedbackEmail(user?.email ?? "");
    setFeedbackMessage("");
    setFeedbackError(null);
    setFeedbackSent(false);
    setFeedbackOpen(true);
  };

  const handleSendFeedback = async () => {
    if (feedbackSending) return;
    setFeedbackError(null);
    if (!isValidEmail(feedbackEmail)) {
      setFeedbackError("that email looks off — double check it?");
      return;
    }
    if (!feedbackMessage.trim()) {
      setFeedbackError("write a message first.");
      return;
    }
    setFeedbackSending(true);
    try {
      await submitFeedback(feedbackEmail, feedbackMessage);
      setFeedbackSent(true);
    } catch (err) {
      setFeedbackError((err as { message?: string })?.message || "couldn't send. try again?");
    } finally {
      setFeedbackSending(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      // signOut already happened inside deleteAccount; bounce to root
      window.location.href = "/";
    } catch (err) {
      setDeleteError((err as { message?: string })?.message || "couldn't delete account.");
      setDeleting(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchProfileStats(), fetchBetHistory()]).then(([s, h]) => {
      setStats(s);
      setBetHistory(h);
      setDataLoading(false);
    });
  }, []);

  const displayName = profile?.display_name ?? "friend";
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }).toLowerCase()
    : "";

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: t.bg }}
    >


      {/* header */}
      <div className="px-5 pt-2 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <BackButton onClick={onBack} />
          <h1
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 22,
              color: t.text,
            }}
          >
            profile
          </h1>
        </div>

        {loading ? (
          <SkeletonProfileContent />
        ) : (
        <>
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
          <Avatar name={displayName} size={56} color={t.primaryLight} />
          <div className="flex-1">
            <div
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 20,
                color: t.text,
              }}
            >
              {displayName.toLowerCase()}
            </div>
            {joinedDate && (
            <div
              style={{
                fontFamily: t.fontBody,
                fontSize: 13,
                color: t.textMuted,
                marginTop: 2,
              }}
            >
              joined {joinedDate}
            </div>
            )}
          </div>
        </div>
        </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-4">
        {loading ? (
          <div className="py-4">
            <LoadingText />
          </div>
        ) : (
        <>
        {/* stats row — the reputation at a glance */}
        <div
          className="grid grid-cols-4 gap-2"
        >
          {[
            { label: "total", value: stats.total },
            { label: "active", value: stats.active },
            { label: "won", value: stats.won },
            { label: "lost", value: stats.lost },
          ].map((s, i) => (
            <div
              key={s.label}
              className="text-center shadow-brutal-sm stagger-in"
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
                  fontSize: 13,
                  color: t.textMuted,
                  marginTop: 2,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* active IOUs — will be populated with settlement data later */}
        <div>
          <h2
            className="mb-2"
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 15,
              color: t.textMuted,
            }}
          >
            active IOUs
          </h2>
          <EmptyState type="ious" />
        </div>

        {/* bet history — your track record */}
        <div>
          <h2
            className="mb-2"
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 15,
              color: t.textMuted,
            }}
          >
            bet history
          </h2>

          {betHistory.length === 0 ? (
            <EmptyState type="pastCircles" />
          ) : (
          <div className="flex flex-col gap-2">
            {betHistory.map((b) => (
              <div
                key={b.circle_id}
                className="flex items-center gap-3 shadow-brutal-sm stagger-in"
                style={{
                  borderRadius: 12,
                  border: `2px solid ${t.border}`,
                  background: b.my_result === "won" ? t.positiveBg : t.bgAlt,
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
                    background: b.my_result === "won" ? t.positive : t.danger + "33",
                    fontSize: 16,
                  }}
                >
                  {b.my_result === "won" ? "✓" : "✗"}
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
                    {b.circle_name}
                  </div>
                  <div
                    style={{
                      fontFamily: t.fontBody,
                      fontSize: 12,
                      color: t.textMuted,
                      marginTop: 1,
                    }}
                  >
                    {b.habit} &middot; {b.duration_weeks} weeks &middot; {b.results.length} people
                  </div>
                </div>
                <Pill
                  color={b.my_result === "won" ? t.positiveBg : t.danger + "22"}
                >
                  {b.my_result}
                </Pill>
              </div>
            ))}
          </div>
          )}
        </div>

        <div className="h-6" />
        </>
        )}
      </div>

      <div className="px-5 pb-6 pt-3 shrink-0 flex flex-col gap-3">
        <BigButton bg={t.bgAlt} onClick={onSignOut} className="w-full">
          sign out
        </BigButton>

        {/* a real action above the footer reference links — feedback gets the
            slightly louder treatment because it is the only one that is
            forward-pointing (the others are exits). */}
        <button
          type="button"
          onClick={openFeedback}
          className="cursor-pointer self-center"
          style={{
            fontFamily: t.fontBody,
            fontSize: 13,
            fontWeight: 500,
            color: t.text,
            background: "transparent",
            border: "none",
            padding: 0,
            textDecoration: "underline",
          }}
        >
          send feedback
        </button>

        {/* meta links — small, findable, not promoted. exit-functionality lives quietly. */}
        <div
          className="flex items-center justify-center gap-3"
          style={{
            fontFamily: t.fontBody,
            fontSize: 13,
            color: t.textMuted,
          }}
        >
          <a href="/privacy" style={{ color: t.textMuted, textDecoration: "underline" }}>
            privacy
          </a>
          <span aria-hidden="true">·</span>
          <a href="/terms" style={{ color: t.textMuted, textDecoration: "underline" }}>
            terms
          </a>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="cursor-pointer"
            style={{
              fontFamily: t.fontBody,
              fontSize: 13,
              color: t.danger,
              background: "transparent",
              border: "none",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            delete account
          </button>
        </div>
      </div>
      <div className="h-[env(safe-area-inset-bottom,0px)]" />

      {feedbackOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: "rgba(26, 10, 0, 0.5)" }}
          onClick={closeFeedback}
        >
          <div
            ref={feedbackRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="shadow-brutal"
            style={{
              borderRadius: 16,
              border: `2px solid ${t.border}`,
              background: t.bg,
              padding: 24,
              maxWidth: 400,
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="feedback-title"
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 20,
                color: t.text,
                marginBottom: 6,
              }}
            >
              send feedback
            </h2>

            {feedbackSent ? (
              <>
                <div
                  style={{
                    fontFamily: t.fontBody,
                    fontSize: 14,
                    color: t.text,
                    lineHeight: 1.5,
                    marginBottom: 16,
                  }}
                >
                  got it. shuvam will get back to you at <strong>{feedbackEmail}</strong>.
                </div>
                <BigButton bg={t.bgAlt} onClick={closeFeedback} className="w-full">
                  close
                </BigButton>
              </>
            ) : (
              <>
                <div
                  style={{
                    fontFamily: t.fontBody,
                    fontSize: 13,
                    color: t.textMuted,
                    marginBottom: 14,
                  }}
                >
                  bug, idea, or anything weird? this lands in shuvam&apos;s inbox.
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <label
                      htmlFor="feedback-email"
                      style={{
                        fontFamily: t.fontBody,
                        fontSize: 12,
                        color: t.textMuted,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      reply to
                    </label>
                    <input
                      id="feedback-email"
                      type="email"
                      autoComplete="email"
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      style={{
                        fontFamily: t.fontBody,
                        fontSize: 15,
                        color: t.text,
                        background: t.bgAlt,
                        border: `2px solid ${t.border}`,
                        borderRadius: 10,
                        padding: "10px 12px",
                        boxShadow: t.shadowSm,
                        width: "100%",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="feedback-message"
                      style={{
                        fontFamily: t.fontBody,
                        fontSize: 12,
                        color: t.textMuted,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      what&apos;s up?
                    </label>
                    <textarea
                      id="feedback-message"
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value.slice(0, FEEDBACK_MAX))}
                      rows={5}
                      className="resize-none shadow-brutal-sm"
                      style={{
                        fontFamily: t.fontBody,
                        fontSize: 14,
                        color: t.text,
                        background: t.bgAlt,
                        border: `2px solid ${t.border}`,
                        borderRadius: 10,
                        padding: "10px 12px",
                        width: "100%",
                        outline: "none",
                      }}
                    />
                    <div
                      className="text-right mt-[2px]"
                      style={{
                        fontFamily: t.fontBody,
                        fontSize: 12,
                        color: t.textMuted,
                      }}
                    >
                      {feedbackMessage.length}/{FEEDBACK_MAX}
                    </div>
                  </div>

                  {feedbackError && (
                    <div
                      style={{
                        fontFamily: t.fontBody,
                        fontSize: 13,
                        color: t.danger,
                        background: t.danger + "15",
                        border: `2px solid ${t.border}`,
                        borderRadius: 8,
                        padding: "8px 12px",
                      }}
                    >
                      {feedbackError}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <BigButton
                    bg={t.positive}
                    onClick={handleSendFeedback}
                    loading={feedbackSending}
                    className="w-full"
                  >
                    send
                  </BigButton>
                  <BigButton bg={t.bgAlt} onClick={closeFeedback} className="w-full">
                    cancel
                  </BigButton>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: "rgba(26, 10, 0, 0.5)" }}
          onClick={closeDelete}
        >
          <div
            ref={deleteRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="shadow-brutal"
            style={{
              borderRadius: 16,
              border: `2px solid ${t.border}`,
              background: t.bg,
              padding: 24,
              maxWidth: 360,
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="delete-account-title"
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 20,
                color: t.text,
                marginBottom: 8,
              }}
            >
              delete your account?
            </h2>
            <div
              style={{
                fontFamily: t.fontBody,
                fontSize: 14,
                color: t.text,
                lineHeight: 1.5,
                marginBottom: 16,
              }}
            >
              this is permanent and immediate. you will leave every active circle (counts as a loss in those), all your logs and reactions disappear, and any IOUs friends owe you in the real world stay between you and them.
            </div>
            {deleteError && (
              <div
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 13,
                  color: t.danger,
                  background: t.danger + "15",
                  border: `2px solid ${t.border}`,
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginBottom: 14,
                }}
              >
                {deleteError}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <BigButton
                bg={t.danger}
                onClick={handleDelete}
                loading={deleting}
                className="w-full"
              >
                yes, delete my account
              </BigButton>
              <BigButton
                bg={t.bgAlt}
                onClick={closeDelete}
                className="w-full"
              >
                keep my account
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
