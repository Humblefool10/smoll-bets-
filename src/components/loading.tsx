"use client";

import { useState, useEffect } from "react";
import { t } from "@/lib/tokens";

// ── loading text ───────────────────────────────────────────────────────────
//
// anthropology: waiting is a social act. in queues, people tolerate waits
// better when they feel seen ("we know you're here") and when there's
// variability (unpredictable > predictable for perceived speed).
//
// the rotating text serves both: it acknowledges the wait, and the
// randomness makes sub-second loads feel instant because the brain
// doesn't have time to read the first message before content arrives.

const LOADING_MESSAGES = [
  "rounding up the crew...",
  "checking who showed up...",
  "counting streaks...",
  "asking the circle...",
  "pulling the receipts...",
  "loading the evidence...",
  "no one can hide...",
];

export function LoadingText() {
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));
    setMounted(true);
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        fontFamily: t.fontBody,
        fontSize: 14,
        color: t.textMuted,
        textAlign: "center",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.2s",
      }}
    >
      {LOADING_MESSAGES[index]}
    </div>
  );
}

// ── skeleton primitives ────────────────────────────────────────────────────
//
// gestalt similarity: skeletons match the shape of real content so the
// brain pre-allocates layout space. when real content arrives, it slots
// into a shape you already accepted. no jump, no surprise.

export function SkeletonBar({
  width = "100%",
  height = 14,
  radius = 6,
}: {
  width?: string | number;
  height?: number;
  radius?: number;
}) {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius: radius,
        background: t.bgAlt,
      }}
    />
  );
}

export function SkeletonCircle({ size = 40 }: { size?: number }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: t.bgAlt,
        flexShrink: 0,
      }}
    />
  );
}

// ── skeleton cards ─────────────────────────────────────────────────────────
// pre-built skeletons that match the shape of real components.

export function SkeletonCircleCard() {
  return (
    <div
      style={{
        borderRadius: 14,
        border: `2px solid ${t.border}20`,
        background: t.bgAlt,
        padding: 16,
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-2">
          <SkeletonBar width={120} height={18} />
          <SkeletonBar width={160} height={13} />
        </div>
        <SkeletonBar width={60} height={24} radius={8} />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex">
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ marginLeft: i === 0 ? 0 : -10 }}>
              <SkeletonCircle size={30} />
            </div>
          ))}
        </div>
        <SkeletonBar width={70} height={15} />
      </div>
    </div>
  );
}

export function SkeletonMemberRow() {
  return (
    <div className="flex items-center gap-3" style={{ padding: "12px 0" }}>
      <SkeletonCircle size={38} />
      <div className="flex-1 flex flex-col gap-2">
        <SkeletonBar width={100} height={15} />
        <div className="flex gap-[6px]">
          <SkeletonBar width={22} height={22} radius={6} />
          <SkeletonBar width={22} height={22} radius={6} />
          <SkeletonBar width={22} height={22} radius={6} />
        </div>
      </div>
      <SkeletonBar width={35} height={16} />
    </div>
  );
}

export function SkeletonFeedItem() {
  return (
    <div
      className="flex gap-[10px] items-start"
      style={{
        borderRadius: 12,
        border: `2px solid ${t.border}20`,
        background: t.bgAlt,
        padding: "12px 14px",
      }}
    >
      <SkeletonCircle size={34} />
      <div className="flex-1 flex flex-col gap-2">
        <SkeletonBar width={140} height={14} />
        <SkeletonBar width="90%" height={13} />
        <SkeletonBar width={60} height={20} radius={8} />
      </div>
    </div>
  );
}

// ── full-page loading ──────────────────────────────────────────────────────
// for cold landings (invite links) where there's no layout to skeleton.

export function LoadingScreen() {
  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-5"
      style={{ background: t.bg }}
    >
      <div
        className="flex items-center justify-center skeleton-logo-pulse"
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          border: `2px solid ${t.border}`,
          background: t.primary,
          boxShadow: t.shadowSm,
        }}
      >
        <span
          style={{
            fontFamily: t.font,
            fontWeight: 700,
            fontSize: 24,
            color: t.text,
          }}
        >
          sb
        </span>
      </div>
      <LoadingText />
    </div>
  );
}
