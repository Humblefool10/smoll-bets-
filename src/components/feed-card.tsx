"use client";

import { useState } from "react";
import Image from "next/image";
import { t } from "@/lib/tokens";
import { Avatar } from "@/components/avatar";
import { Pill } from "@/components/pill";
import type { FeedItem, ReactionTally, ReactionType } from "@/lib/circles";
import { REACTION_LABELS, addReaction, removeReaction } from "@/lib/circles";
import { useAuth } from "@/lib/use-auth";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function FeedCard({ item }: { item: FeedItem }) {
  const { user } = useAuth();
  const isOwnLog = user?.id === item.user_id;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, setPending] = useState<ReactionType | null>(null);

  const toggle = async (r: ReactionTally) => {
    if (isOwnLog || pending) return;
    setPending(r.type);
    try {
      if (r.mine) await removeReaction(item.id, r.type);
      else await addReaction(item.id, r.type);
    } catch {
      // realtime will reconcile
    } finally {
      setPending(null);
      setPickerOpen(false);
    }
  };

  const visibleChips = item.reactions.filter((r) => r.count > 0);

  return (
    <div
      className="flex gap-[10px] items-start shadow-brutal-sm stagger-in"
      style={{
        borderRadius: 12,
        border: `2px solid ${t.border}`,
        background: t.bgAlt,
        padding: "12px 14px",
      }}
    >
      <Avatar name={item.display_name} size={34} />
      <div className="flex-1 min-w-0">
        <div
          style={{
            fontFamily: t.font,
            fontWeight: 700,
            fontSize: 14,
            color: t.text,
          }}
        >
          {item.display_name}{" "}
          <span
            style={{
              fontWeight: 400,
              color: t.textMuted,
              fontSize: 13,
            }}
          >
            {timeAgo(item.logged_at)}
          </span>
        </div>
        {item.note && (
          <div
            className="mt-[3px]"
            style={{
              fontFamily: t.fontBody,
              fontSize: 13,
              color: t.text,
              wordBreak: "break-word",
            }}
          >
            {item.note}
          </div>
        )}
        {item.photo_url && (
          <div
            className="mt-[8px] shadow-brutal-sm relative"
            style={{
              borderRadius: 10,
              border: `2px solid ${t.border}`,
              overflow: "hidden",
              width: "100%",
              maxWidth: 280,
              aspectRatio: "5 / 4",
            }}
          >
            <Image
              src={item.photo_url}
              alt="proof"
              fill
              sizes="280px"
              style={{ objectFit: "cover" }}
            />
          </div>
        )}
        <div className="mt-[6px]">
          <Pill color={t.positiveBg}>
            ✓ {item.type === "photo" ? "photo proof" : "honor log"}
          </Pill>
        </div>

        {/* reactions — chips show only when count > 0; the picker is hidden behind a small "+ react" button. on your own log: chips only, no react button. */}
        {(visibleChips.length > 0 || (!isOwnLog)) && (
          <div className="flex flex-wrap gap-[6px] mt-[10px] items-center">
            {visibleChips.map((r) => (
              <button
                key={r.type}
                type="button"
                disabled={isOwnLog || pending !== null}
                onClick={() => toggle(r)}
                className={isOwnLog ? "" : "cursor-pointer"}
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 12,
                  fontWeight: r.mine ? 700 : 500,
                  color: r.mine ? t.text : t.textMuted,
                  background: r.mine ? t.primaryLight : t.bgAlt,
                  border: `2px solid ${t.border}`,
                  borderRadius: 999,
                  padding: "4px 10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  opacity: pending === r.type ? 0.6 : 1,
                }}
              >
                <span>{REACTION_LABELS[r.type]}</span>
                <span style={{ opacity: 0.7 }}>{r.count}</span>
              </button>
            ))}

            {!isOwnLog && (
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                className="cursor-pointer"
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 12,
                  fontWeight: 500,
                  color: t.textMuted,
                  background: "transparent",
                  border: `2px dashed ${t.border}`,
                  borderRadius: 999,
                  padding: "4px 10px",
                }}
                aria-expanded={pickerOpen}
              >
                {pickerOpen ? "close" : "+ react"}
              </button>
            )}
          </div>
        )}

        {/* picker — appears under the chip row when "+ react" is tapped. shows the full vocabulary so the user knows what's available. tap to toggle, then collapse. */}
        {pickerOpen && !isOwnLog && (
          <div className="flex flex-wrap gap-[6px] mt-[8px]">
            {item.reactions.map((r) => (
              <button
                key={r.type}
                type="button"
                disabled={pending !== null}
                onClick={() => toggle(r)}
                className="cursor-pointer"
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 12,
                  fontWeight: r.mine ? 700 : 500,
                  color: r.mine ? t.text : t.textMuted,
                  background: r.mine ? t.primaryLight : t.bgAlt,
                  border: `2px solid ${t.border}`,
                  borderRadius: 999,
                  padding: "6px 12px",
                  opacity: pending === r.type ? 0.6 : 1,
                }}
              >
                {REACTION_LABELS[r.type]}{r.mine ? " ✓" : ""}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
