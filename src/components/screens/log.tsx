"use client";

import { useState, useRef, useEffect } from "react";
import { t } from "@/lib/tokens";
import { Pill } from "@/components/pill";
import { BigButton } from "@/components/big-button";

import { BackButton } from "@/components/back-button";
import { Confetti } from "@/components/confetti";
import { FeedCard } from "@/components/feed-card";
import { playChime } from "@/lib/sounds";
import { logHabit, uploadProofPhoto, fetchCircleFeed, fetchTodaysLog } from "@/lib/circles";
import type { FeedItem } from "@/lib/circles";
import { useCircleDetail } from "@/lib/use-circles";
import { supabase } from "@/lib/supabase";

const CAPTION_MAX = 140;

export function LogScreen({
  circleId,
  onBack,
}: {
  circleId: string | null;
  onBack?: () => void;
}) {
  const { circle } = useCircleDetail(circleId);
  const [state, setState] = useState<"checking" | "idle" | "preview" | "done" | "already">("checking");
  const [logging, setLogging] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [recentFeed, setRecentFeed] = useState<FeedItem[]>([]);
  const [existingLog, setExistingLog] = useState<FeedItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // on mount, see if the user has already logged today.
  // if so, jump straight to the "already" state instead of making them
  // walk through the form and discover the duplicate at submit time.
  useEffect(() => {
    if (!circleId) return;
    let cancelled = false;
    (async () => {
      const [today, recent] = await Promise.all([
        fetchTodaysLog(circleId),
        fetchCircleFeed(circleId, 3),
      ]);
      if (cancelled) return;
      if (today) {
        setExistingLog(today);
        setRecentFeed(recent);
        setState("already");
      } else {
        setState("idle");
      }
    })();
    return () => { cancelled = true; };
  }, [circleId]);

  // realtime: keep "today's room" and the existing-log card fresh as
  // friends react or log throughout the day. matches the circle screen pattern.
  useEffect(() => {
    if (!circleId) return;
    const channel = supabase
      .channel(`log-screen:${circleId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "logs", filter: `circle_id=eq.${circleId}` },
        async () => {
          const [today, recent] = await Promise.all([
            fetchTodaysLog(circleId),
            fetchCircleFeed(circleId, 3),
          ]);
          if (today) setExistingLog(today);
          setRecentFeed(recent);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reactions" },
        async () => {
          const [today, recent] = await Promise.all([
            fetchTodaysLog(circleId),
            fetchCircleFeed(circleId, 3),
          ]);
          if (today) setExistingLog(today);
          setRecentFeed(recent);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [circleId]);

  const circleName = circle?.name ?? "";
  const target = circle?.target ?? 0;
  // while circle loads, show both methods to avoid a flicker; once loaded,
  // honor the creator's verification setting.
  const showHonor = !circle || circle.verification === "honor" || circle.verification === "both";
  const showPhoto = !circle || circle.verification === "proof" || circle.verification === "both";

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
      let photoUrl: string | undefined;
      if (type === "photo" && photoFile) {
        photoUrl = await uploadProofPhoto(circleId, photoFile);
      }
      const note = caption.trim() || undefined;
      await logHabit({
        circleId,
        type,
        photoUrl,
        note,
        weekNumber: getCurrentWeek(),
      });
      // pull the room — the just-submitted log will be at the top.
      const recent = await fetchCircleFeed(circleId, 3);
      setRecentFeed(recent);
      setState("done");
      playChime();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "";
      if (msg.includes("duplicate") || msg.includes("unique")) {
        // race: a log slipped in between mount-check and submit
        // (other tab, slow network). switch to the same "already" state
        // the mount check uses, so the user sees a coherent screen.
        const [today, recent] = await Promise.all([
          fetchTodaysLog(circleId),
          fetchCircleFeed(circleId, 3),
        ]);
        if (today) setExistingLog(today);
        setRecentFeed(recent);
        setState("already");
      } else {
        console.error("failed to log:", err);
      }
    } finally {
      setLogging(false);
    }
  };

  const handlePhotoPick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setState("preview");
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
              <h1
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 18,
                  color: t.text,
                }}
              >
                log today
              </h1>
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
            {/* caption — optional, the thing you'd say to the group */}
            <div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, CAPTION_MAX))}
                placeholder="say something? (optional)"
                rows={2}
                className="resize-none shadow-brutal-sm"
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 14,
                  color: t.text,
                  background: t.bgAlt,
                  border: `2px solid ${t.border}`,
                  borderRadius: 12,
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
                {caption.length}/{CAPTION_MAX}
              </div>
            </div>

            <div
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 15,
                color: t.textMuted,
              }}
            >
              {showHonor && showPhoto
                ? "how do you want to prove it?"
                : showHonor
                ? "log your honor"
                : "snap your proof"}
            </div>

            {/* honor log */}
            {showHonor && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleLog("honor")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleLog("honor");
                }
              }}
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
            )}

            {/* hidden file input — camera on mobile, file picker on desktop */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              aria-label="upload proof photo"
              className="hidden"
            />

            {/* photo proof */}
            {showPhoto && (
            <div
              role="button"
              tabIndex={0}
              onClick={handlePhotoPick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handlePhotoPick();
                }
              }}
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
            )}
          </div>
        </>
      )}

      {state === "preview" && photoPreview && (
        <div className="flex flex-col h-full">
          <div className="px-5 pt-2 shrink-0">
            <div className="flex items-center gap-[10px] mb-4">
              <BackButton onClick={() => {
                setPhotoFile(null);
                setPhotoPreview(null);
                setState("idle");
              }} />
              <h1
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 18,
                  color: t.text,
                }}
              >
                photo proof
              </h1>
            </div>
          </div>

          <div className="flex-1 px-5 flex flex-col gap-4 items-center justify-center">
            <div
              className="shadow-brutal"
              style={{
                borderRadius: 16,
                border: `2px solid ${t.border}`,
                overflow: "hidden",
                maxWidth: 300,
                width: "100%",
              }}
            >
              {/* blob: URL from URL.createObjectURL — next/image can't optimize blob sources */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="proof preview"
                style={{
                  width: "100%",
                  display: "block",
                  objectFit: "cover",
                  maxHeight: 360,
                }}
              />
            </div>
            <div
              style={{
                fontFamily: t.fontBody,
                fontSize: 13,
                color: t.textMuted,
                textAlign: "center",
              }}
            >
              this will be visible to your circle.
            </div>
          </div>

          <div className="px-5 pb-6 pt-3 shrink-0 flex flex-col gap-2">
            <BigButton
              bg={t.positive}
              onClick={() => handleLog("photo")}
              loading={logging}
              className="w-full"
            >
              submit proof
            </BigButton>
            <BigButton
              bg={t.bgAlt}
              onClick={() => {
                setPhotoFile(null);
                setPhotoPreview(null);
                setState("idle");
              }}
              className="w-full"
            >
              retake
            </BigButton>
          </div>
        </div>
      )}

      {state === "checking" && (
        <div className="flex-1" />
      )}

      {state === "already" && (
        <div className="flex flex-col h-full">
          <div className="px-5 pt-2 shrink-0">
            <div className="flex items-center gap-[10px] mb-4">
              <BackButton onClick={onBack} />
              <h1
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 18,
                  color: t.text,
                }}
              >
                today
              </h1>
            </div>

            <div
              className="shadow-brutal mb-4"
              style={{
                borderRadius: 14,
                border: `2px solid ${t.border}`,
                background: t.positiveBg,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 18,
                  color: t.text,
                  lineHeight: 1.2,
                }}
              >
                ✓ you logged today
              </div>
              <div
                className="mt-1"
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 13,
                  color: t.textMuted,
                }}
              >
                come back tomorrow to keep the streak going.
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-3">
            {existingLog && (
              <>
                <h2
                  style={{
                    fontFamily: t.font,
                    fontWeight: 700,
                    fontSize: 14,
                    color: t.textMuted,
                    textTransform: "lowercase",
                    letterSpacing: 0.5,
                  }}
                >
                  your log
                </h2>
                <FeedCard item={existingLog} />
              </>
            )}

            {(() => {
              const others = recentFeed.filter((f) => f.id !== existingLog?.id);
              if (others.length === 0) return null;
              return (
                <>
                  <h2
                    className="mt-2"
                    style={{
                      fontFamily: t.font,
                      fontWeight: 700,
                      fontSize: 14,
                      color: t.textMuted,
                      textTransform: "lowercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    today in {circleName || "your circle"}
                  </h2>
                  {others.map((f) => <FeedCard key={f.id} item={f} />)}
                </>
              );
            })()}
          </div>

          <div className="px-5 pb-6 pt-3 shrink-0">
            <BigButton bg={t.bgAlt} onClick={onBack} className="w-full">
              back to circle
            </BigButton>
          </div>
        </div>
      )}

      {state === "done" && (
        <div className="flex flex-col h-full">
          <Confetti count={35} />
          {/* the pop — short and central, not the whole screen */}
          <div className="px-7 pt-6 pb-4 shrink-0 flex flex-col items-center gap-3 text-center">
            <div
              className="flex items-center justify-center shadow-brutal celebrate-pop"
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                border: `3px solid ${t.border}`,
                background: t.positive,
              }}
            >
              <svg
                className="check-draw"
                width="36"
                height="36"
                viewBox="0 0 48 48"
                fill="none"
                stroke={t.border}
                strokeWidth="3"
                strokeLinecap="round"
              >
                <path d="M10 24l10 10L38 14" />
              </svg>
            </div>
            <h1
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 24,
                color: t.text,
                lineHeight: 1.1,
              }}
            >
              logged.
            </h1>
          </div>

          {/* the room — what everyone else has been up to today */}
          <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-3">
            <h2
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 14,
                color: t.textMuted,
                textTransform: "lowercase",
                letterSpacing: 0.5,
              }}
            >
              today in {circleName || "your circle"}
            </h2>
            {recentFeed.length === 0 ? (
              <div
                className="shadow-brutal-sm"
                style={{
                  borderRadius: 12,
                  border: `2px solid ${t.border}`,
                  background: t.bgAlt,
                  padding: "14px 16px",
                  fontFamily: t.fontBody,
                  fontSize: 14,
                  color: t.textMuted,
                }}
              >
                you&apos;re first today. the room fills up as others log.
              </div>
            ) : (
              recentFeed.map((f) => <FeedCard key={f.id} item={f} />)
            )}
          </div>

          <div className="px-5 pb-6 pt-3 shrink-0">
            <BigButton bg={t.bgAlt} onClick={onBack} className="w-full">
              back to circle
            </BigButton>
          </div>
        </div>
      )}
    </div>
  );
}
