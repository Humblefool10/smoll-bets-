"use client";

import { t } from "@/lib/tokens";
import { Avatar } from "@/components/avatar";
import { Pill } from "@/components/pill";
import type { FeedItem } from "@/lib/circles";

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
              fontSize: 12,
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
            className="mt-[8px] shadow-brutal-sm"
            style={{
              borderRadius: 10,
              border: `2px solid ${t.border}`,
              overflow: "hidden",
              maxWidth: 280,
            }}
          >
            <img
              src={item.photo_url}
              alt="proof"
              style={{
                width: "100%",
                display: "block",
                objectFit: "cover",
                maxHeight: 220,
              }}
            />
          </div>
        )}
        <div className="mt-[6px]">
          <Pill color={t.positiveBg}>
            ✓ {item.type === "photo" ? "photo proof" : "honor log"}
          </Pill>
        </div>
      </div>
    </div>
  );
}
