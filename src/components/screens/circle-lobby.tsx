"use client";

import { useState, useCallback } from "react";
import { t } from "@/lib/tokens";
import { Avatar } from "@/components/avatar";
import { Pill } from "@/components/pill";
import { BigButton } from "@/components/big-button";

import { BackButton } from "@/components/back-button";
import { SkeletonMemberRow, SkeletonBar, LoadingText } from "@/components/loading";
import { EditCircleDialog } from "@/components/edit-circle-dialog";
import { useCircleDetail } from "@/lib/use-circles";
import { useAuth } from "@/lib/use-auth";
import { updateCircle, deleteCircle } from "@/lib/circles";
import { useModalA11y } from "@/lib/use-modal-a11y";

// ── member slot ─────────────────────────────────────────────────────────────
// gestalt closure: filled avatars + dashed ghost slots.
// the incomplete pattern creates psychological tension to fill the gaps.

function MemberSlot({
  name,
  joinedAgo,
  isYou,
  isCreator,
}: {
  name?: string;
  joinedAgo?: string;
  isYou?: boolean;
  isCreator?: boolean;
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
          {isCreator && (
            <span
              style={{
                fontSize: 10,
                color: t.textMuted,
                fontWeight: 400,
                marginLeft: 4,
              }}
            >
              creator
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

// ── circle lobby screen ─────────────────────────────────────────────────────
// the pre-game state. the circle exists, the bet is set,
// but the tribe is still assembling. this screen should feel
// like a countdown, not a waiting room.

export function CircleLobbyScreen({
  circleId,
  onBack,
  onStart,
  onDelete,
}: {
  circleId: string | null;
  onBack?: () => void;
  onStart?: () => void;
  onDelete?: () => void;
}) {
  const { user } = useAuth();
  const { circle, members: rawMembers, loading, refresh } = useCircleDetail(circleId);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeDelete = useCallback(() => { if (!deleting) setDeleteConfirm(false); }, [deleting]);
  const menuRef = useModalA11y(menuOpen, closeMenu);
  const deleteRef = useModalA11y(deleteConfirm, closeDelete);

  const circleName = circle?.name ?? "loading...";
  const habit = circle?.habit ?? "";
  const duration = circle?.duration_weeks?.toString() ?? "";
  const stakes = circle?.stakes ?? "";
  const maxMembers = circle?.max_members ?? 4;
  const inviteCode = circle?.invite_code ?? "";
  const inviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/invite/${inviteCode}`
    : `/invite/${inviteCode}`;

  const members = rawMembers.map((m) => ({
    name: m.display_name,
    joinedAgo: m.role === "creator" ? "created the circle" : "joined",
    isYou: m.user_id === user?.id,
    isCreator: m.role === "creator",
  }));

  const emptySlots = maxMembers - members.length;
  const minToStart = 2;
  const isCreator = rawMembers.some((m) => m.user_id === user?.id && m.role === "creator");
  const canStart = members.length >= minToStart && isCreator;

  const handleCopy = () => {
    navigator.clipboard?.writeText(inviteUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareText = `join ${circleName} on smoll bets. ${habit}, loser ${stakes}. ${inviteUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `join ${circleName} on smoll bets`,
          text: shareText,
        });
        return;
      } catch {
        // user dismissed or share failed — fall through to copy
      }
    }
    navigator.clipboard?.writeText(shareText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: t.bg }}>


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
          <div className="flex-1" />
          {isCreator && (
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="circle options"
              className="cursor-pointer"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `2px solid ${t.border}`,
                background: t.bgAlt,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: t.shadowSm,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill={t.text}>
                <circle cx="7" cy="2.5" r="1.5" />
                <circle cx="7" cy="7" r="1.5" />
                <circle cx="7" cy="11.5" r="1.5" />
              </svg>
            </button>
          )}
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
        {loading ? (
          <>
            <div className="py-3">
              <LoadingText />
            </div>
            {[0, 1, 2].map((i) => (
              <SkeletonMemberRow key={i} />
            ))}
            <div className="mt-2">
              <SkeletonBar width="100%" height={80} radius={14} />
            </div>
          </>
        ) : (
        <>
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
                  isCreator={m.isCreator}
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
            : !isCreator && members.length >= minToStart
            ? "waiting for the creator to start the challenge."
            : `need at least ${minToStart} people to start the challenge.`}
        </div>

        </>
        )}
      </div>

      <div className="px-5 pb-6 pt-3 shrink-0">
        {canStart ? (
          <BigButton bg={t.positive} onClick={onStart} className="w-full">
            start the challenge
          </BigButton>
        ) : (
          <BigButton bg={t.bgAlt} disabled className="w-full">
            {!isCreator && members.length >= minToStart
              ? "waiting for creator to start..."
              : "waiting for people to join..."}
          </BigButton>
        )}
      </div>

      {/* options menu (creator only) */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center"
          style={{ background: "rgba(26, 10, 0, 0.45)" }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="circle options"
            className="w-full max-w-[430px] shadow-brutal mb-4 mx-4"
            style={{
              borderRadius: 16,
              border: `2px solid ${t.border}`,
              background: t.bg,
              padding: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <BigButton
                bg={t.bgAlt}
                onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                className="w-full"
              >
                edit the bet
              </BigButton>
              <BigButton
                bg={t.danger}
                onClick={() => { setMenuOpen(false); setDeleteConfirm(true); }}
                className="w-full"
              >
                delete circle
              </BigButton>
              <BigButton
                bg={t.bgAlt}
                onClick={() => setMenuOpen(false)}
                className="w-full"
              >
                cancel
              </BigButton>
            </div>
          </div>
        </div>
      )}

      {/* edit dialog */}
      {circle && (
        <EditCircleDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={async (data) => {
            if (!circleId) return;
            await updateCircle(circleId, data);
            await refresh();
          }}
          initial={{
            name: circle.name,
            habit: circle.habit,
            target: circle.target,
            durationWeeks: circle.duration_weeks,
            stakes: circle.stakes,
            verification: circle.verification,
            maxMembers: circle.max_members,
          }}
          minMaxMembers={Math.max(2, members.length)}
        />
      )}

      {/* delete confirmation */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: "rgba(26, 10, 0, 0.5)" }}
          onClick={closeDelete}
        >
          <div
            ref={deleteRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            className="shadow-brutal"
            style={{
              borderRadius: 16,
              border: `2px solid ${t.border}`,
              background: t.bg,
              padding: 24,
              maxWidth: 320,
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              id="delete-confirm-title"
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 20,
                color: t.text,
                marginBottom: 8,
              }}
            >
              delete this circle?
            </div>
            <div
              style={{
                fontFamily: t.fontBody,
                fontSize: 14,
                color: t.textMuted,
                lineHeight: 1.5,
                marginBottom: 20,
              }}
            >
              everyone who joined gets removed, the invite link stops working, and there&apos;s no undo.
            </div>
            <div className="flex flex-col gap-2">
              <BigButton
                bg={t.danger}
                loading={deleting}
                onClick={async () => {
                  if (!circleId || deleting) return;
                  setDeleting(true);
                  try {
                    await deleteCircle(circleId);
                    setDeleteConfirm(false);
                    onDelete?.();
                  } catch (err) {
                    console.error("failed to delete:", err);
                    setDeleting(false);
                  }
                }}
                className="w-full"
              >
                delete, i&apos;m sure
              </BigButton>
              <BigButton
                bg={t.bgAlt}
                onClick={() => setDeleteConfirm(false)}
                className="w-full"
              >
                keep it
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
