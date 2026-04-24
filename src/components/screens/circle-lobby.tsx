"use client";

import { useState } from "react";
import { t } from "@/lib/tokens";
import { Avatar } from "@/components/avatar";
import { Pill } from "@/components/pill";
import { BigButton } from "@/components/big-button";
import { StatusBar } from "@/components/status-bar";
import { BackButton } from "@/components/back-button";

// ── member slot ─────────────────────────────────────────────────────────────
// gestalt closure: filled avatars + dashed ghost slots.
// the incomplete pattern creates psychological tension to fill the gaps.

function MemberSlot({
  name,
  joinedAgo,
  isYou,
}: {
  name?: string;
  joinedAgo?: string;
  isYou?: boolean;
}) {
  if (!name) {
    // empty slot — dashed border, inviting the eye to complete the pattern
    return (
      <div className="flex items-center gap-3 py-3">
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            border: `2px dashed ${t.border}44`,
            background: t.bgAlt,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke={t.border + "44"}
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M8 4v8M4 8h8" />
          </svg>
        </div>
        <div
          style={{
            fontFamily: t.fontBody,
            fontSize: 14,
            color: t.textMuted + "88",
            fontStyle: "italic",
          }}
        >
          waiting for someone...
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <Avatar name={name} size={42} color={isYou ? t.primaryLight : undefined} />
      <div className="flex-1">
        <div
          style={{
            fontFamily: t.font,
            fontWeight: 700,
            fontSize: 15,
            color: t.text,
          }}
        >
          {name}
          {isYou && (
            <span
              style={{
                fontWeight: 400,
                color: t.textMuted,
                fontSize: 13,
                marginLeft: 4,
              }}
            >
              (you)
            </span>
          )}
        </div>
        {joinedAgo && (
          <div
            style={{
              fontFamily: t.fontBody,
              fontSize: 12,
              color: t.textMuted,
              marginTop: 1,
            }}
          >
            {joinedAgo}
          </div>
        )}
      </div>
      <Pill color={t.positiveBg}>in ✓</Pill>
    </div>
  );
}

// ── join event ───────────────────────────────────────────────────────────────
// each join is a mini dopamine hit for the initiator.
// social proof: seeing others join validates the initiator's choice.

function JoinEvent({ name, time }: { name: string; time: string }) {
  return (
    <div
      className="flex items-center gap-3"
      style={{
        borderRadius: 10,
        border: `2px solid ${t.border}`,
        background: t.positiveBg,
        padding: "10px 14px",
        boxShadow: t.shadowSm,
      }}
    >
      <Avatar name={name} size={28} />
      <div className="flex-1">
        <span
          style={{
            fontFamily: t.font,
            fontWeight: 700,
            fontSize: 13,
            color: t.text,
          }}
        >
          {name.toLowerCase()} just joined
        </span>
      </div>
      <span
        style={{
          fontFamily: t.fontBody,
          fontSize: 12,
          color: t.textMuted,
        }}
      >
        {time}
      </span>
    </div>
  );
}

// ── circle lobby screen ─────────────────────────────────────────────────────
// the pre-game state. the circle exists, the bet is set,
// but the tribe is still assembling. this screen should feel
// like a countdown, not a waiting room.

export function CircleLobbyScreen({
  onBack,
  onStart,
  circleName = "gym rats",
  habit = "run 3x per week",
  duration = "4",
  stakes = "cook dinner for the group",
  verification = "proof" as "honor" | "proof",
}: {
  onBack?: () => void;
  onStart?: () => void;
  circleName?: string;
  habit?: string;
  duration?: string;
  stakes?: string;
  verification?: "honor" | "proof";
}) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = "smollbets.app/invite/gym-rats-a1b2c3";

  // simulated state — in production this comes from Supabase
  const members = [
    { name: "Maya P", joinedAgo: "just now (created the circle)", isYou: true },
    { name: "Priya S", joinedAgo: "2 minutes ago" },
  ];
  const joinEvents = [
    { name: "Priya S", time: "2m ago" },
  ];
  const maxMembers = 6;
  const emptySlots = maxMembers - members.length;
  const minToStart = 2;
  const canStart = members.length >= minToStart;

  const handleCopy = () => {
    navigator.clipboard?.writeText(inviteUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `join "${circleName}" on smoll bets`,
          text: `${habit}. loser ${stakes}. you in?`,
          url: inviteUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: t.bg }}>
      <StatusBar />

      {/* header */}
      <div className="px-5 pt-2 pb-3 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <BackButton onClick={onBack} />
          <div
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 22,
              color: t.text,
            }}
          >
            {circleName}
          </div>
          <Pill color={t.primaryLight}>waiting</Pill>
        </div>

        {/* the bet summary card */}
        <div
          className="shadow-brutal-sm"
          style={{
            background: t.bgAlt,
            borderRadius: 10,
            border: `2px solid ${t.border}`,
            padding: "10px 14px",
          }}
        >
          <div className="flex gap-2 flex-wrap mb-2">
            <Pill color={t.primaryLight}>{habit}</Pill>
            <Pill color={t.bgAlt}>{duration} weeks</Pill>
          </div>
          <div
            style={{
              fontFamily: t.fontBody,
              fontSize: 13,
              color: t.textMuted,
              marginBottom: 2,
            }}
          >
            the stakes
          </div>
          <div
            style={{
              fontFamily: t.fontBody,
              fontSize: 14,
              color: t.text,
              fontWeight: 500,
            }}
          >
            loser {stakes}.
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-4">
        {/* member slots — the incomplete pattern */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 15,
                color: t.textMuted,
              }}
            >
              who&apos;s in ({members.length}/{maxMembers})
            </span>
            <span
              style={{
                fontFamily: t.fontBody,
                fontSize: 13,
                color: t.textMuted,
              }}
            >
              {emptySlots} {emptySlots === 1 ? "spot" : "spots"} left
            </span>
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
            {members.map((m, i) => (
              <div
                key={i}
                style={{
                  padding: "0 14px",
                  borderBottom:
                    i < members.length + Math.min(emptySlots, 3) - 1
                      ? `1px solid ${t.border}15`
                      : "none",
                }}
              >
                <MemberSlot
                  name={m.name}
                  joinedAgo={m.joinedAgo}
                  isYou={m.isYou}
                />
              </div>
            ))}
            {/* show up to 3 empty slots (gestalt: suggest the pattern without overdoing it) */}
            {Array.from({ length: Math.min(emptySlots, 3) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                style={{
                  padding: "0 14px",
                  borderBottom:
                    i < Math.min(emptySlots, 3) - 1
                      ? `1px solid ${t.border}15`
                      : "none",
                }}
              >
                <MemberSlot />
              </div>
            ))}
            {emptySlots > 3 && (
              <div
                className="text-center py-2"
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 12,
                  color: t.textMuted,
                }}
              >
                +{emptySlots - 3} more {emptySlots - 3 === 1 ? "slot" : "slots"}
              </div>
            )}
          </div>
        </div>

        {/* join events feed — social proof / dopamine */}
        {joinEvents.length > 0 && (
          <div className="flex flex-col gap-2">
            {joinEvents.map((e, i) => (
              <JoinEvent key={i} name={e.name} time={e.time} />
            ))}
          </div>
        )}

        {/* invite section — always prominent, never buried */}
        <div
          style={{
            borderRadius: 14,
            border: `2px solid ${t.border}`,
            background: t.primaryBg,
            padding: 16,
            boxShadow: t.shadow,
          }}
        >
          <div
            className="mb-3"
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 16,
              color: t.text,
            }}
          >
            invite more people
          </div>

          {/* link row */}
          <div
            className="flex items-center gap-2 mb-3"
            style={{
              borderRadius: 10,
              border: `2px solid ${t.border}`,
              background: t.bg,
              padding: "10px 12px",
              boxShadow: t.shadowSm,
            }}
          >
            <div
              className="flex-1 truncate"
              style={{
                fontFamily: t.fontBody,
                fontSize: 13,
                color: t.textMuted,
              }}
            >
              {inviteUrl}
            </div>
            <div
              onClick={handleCopy}
              className="cursor-pointer shrink-0"
              style={{
                borderRadius: 6,
                border: `2px solid ${t.border}`,
                background: copied ? t.positive : t.bg,
                padding: "4px 10px",
                boxShadow: t.shadowSm,
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 12,
                color: t.text,
                transition: "background 0.15s",
              }}
            >
              {copied ? "copied" : "copy"}
            </div>
          </div>

          <BigButton onClick={handleShare} className="w-full">
            <span className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 18 18"
                fill="none"
                stroke={t.text}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 12v3a1 1 0 001 1h8a1 1 0 001-1v-3M12 5L9 2 6 5M9 2v10" />
              </svg>
              share invite link
            </span>
          </BigButton>
        </div>

        {/* starts when... indicator */}
        <div
          className="text-center py-2"
          style={{
            fontFamily: t.fontBody,
            fontSize: 14,
            color: t.textMuted,
          }}
        >
          {canStart
            ? "you have enough people to start. more can join later."
            : `need at least ${minToStart} people to start the challenge.`}
        </div>

      </div>

      <div className="px-5 pb-6 pt-3 shrink-0">
        {canStart ? (
          <BigButton bg={t.positive} onClick={onStart} className="w-full">
            start the challenge
          </BigButton>
        ) : (
          <BigButton bg={t.bgAlt} disabled className="w-full">
            waiting for people to join...
          </BigButton>
        )}
      </div>
    </div>
  );
}
