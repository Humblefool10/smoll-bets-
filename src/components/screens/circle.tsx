"use client";

import { useState, useEffect, useCallback } from "react";
import { t } from "@/lib/tokens";
import { Avatar } from "@/components/avatar";
import { Pill } from "@/components/pill";
import { BigButton } from "@/components/big-button";

import { BackButton } from "@/components/back-button";
import { SkeletonMemberRow, SkeletonFeedItem, LoadingText } from "@/components/loading";
import { EmptyState } from "@/components/empty-state";
import { FeedCard } from "@/components/feed-card";
import { EditCircleDialog } from "@/components/edit-circle-dialog";
import { useCircleDetail } from "@/lib/use-circles";
import { useAuth } from "@/lib/use-auth";
import { fetchCircleFeed, checkAndSettle, updateCircle, resetCircleProgress } from "@/lib/circles";
import type { FeedItem } from "@/lib/circles";
import { currentRitualBeat } from "@/lib/beats";
import { supabase } from "@/lib/supabase";

const rankEmoji = ["🥇", "🥈", "🥉", "😬"];

export function CircleScreen({
  circleId,
  onBack,
  onLog,
  onCompleted,
  onLeave,
}: {
  circleId: string | null;
  onBack?: () => void;
  onLog?: () => void;
  onCompleted?: () => void;
  onLeave?: () => void;
}) {
  const { user } = useAuth();
  const { circle, members: rawMembers, loading, refresh } = useCircleDetail(circleId);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [logCounts, setLogCounts] = useState<Record<string, number>>({});

  const isCreator = !!user && rawMembers.some(
    (m) => m.user_id === user.id && m.role === "creator",
  );
  const canEdit = isCreator && circle?.status === "active";

  const circleName = circle?.name ?? "loading...";
  const stakes = circle?.stakes ?? "";

  // load feed + log counts (separate query for accurate counts)
  const loadFeed = useCallback(async () => {
    if (!circleId) return;
    const [items, { data: allLogs }] = await Promise.all([
      fetchCircleFeed(circleId),
      supabase.from("logs").select("user_id").eq("circle_id", circleId),
    ]);
    setFeed(items);
    const counts: Record<string, number> = {};
    allLogs?.forEach((l: { user_id: string }) => {
      counts[l.user_id] = (counts[l.user_id] || 0) + 1;
    });
    setLogCounts(counts);
  }, [circleId]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  // realtime: refetch feed + counts when logs OR reactions change in this circle.
  // reactions don't have a circle_id column — we just refetch on any reaction
  // change and let the per-circle filter happen client-side. cheap at alpha scale;
  // if the table grows, narrow this with a server-side join via a view.
  useEffect(() => {
    if (!circleId) return;
    const channel = supabase
      .channel(`circle-logs:${circleId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "logs", filter: `circle_id=eq.${circleId}` },
        () => { loadFeed(); }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reactions" },
        () => { loadFeed(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [circleId, loadFeed]);

  // auto-settle: check if circle has expired
  useEffect(() => {
    if (!circleId || !circle || circle.status !== "active") return;
    checkAndSettle(circleId).then((settlement) => {
      if (settlement) onCompleted?.();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circleId, circle?.status]);

  const members = rawMembers.map((m, i) => ({
    name: m.display_name,
    done: logCounts[m.user_id] || 0,
    target: (circle?.target ?? 1) * (circle?.duration_weeks ?? 1),
    rank: i + 1,
    isMe: m.user_id === user?.id,
    isCreator: m.role === "creator",
  })).sort((a, b) => b.done - a.done);

  function weeksLeft(): number | null {
    if (!circle?.started_at) return null;
    const start = new Date(circle.started_at);
    const end = new Date(start.getTime() + circle.duration_weeks * 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(0, diff);
  }

  const wl = weeksLeft();

  // ritual moment card (Tier 2). null when no beat is currently active.
  const beat = circle
    ? currentRitualBeat(
        {
          status: circle.status,
          started_at: circle.started_at,
          duration_weeks: circle.duration_weeks,
          target: circle.target,
        },
        rawMembers.map((m) => ({ logCount: logCounts[m.user_id] || 0 })),
      )
    : null;

  return (
    <div
      className="flex flex-col h-full relative"
      style={{ background: t.bg }}
    >

      <div className="px-5 pt-1 pb-3 shrink-0">
        <div className="flex items-center gap-3 mb-[10px]">
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
          <Pill color={t.primaryLight}>{wl !== null ? `${wl}w left` : "active"}</Pill>
          <div className="flex-1" />
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
        </div>
        <div
          className="shadow-brutal-sm"
          style={{
            background: t.bgAlt,
            borderRadius: 10,
            border: `2px solid ${t.border}`,
            padding: "10px 14px",
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

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-3">
        {loading ? (
          <>
            <div className="py-4">
              <LoadingText />
            </div>
            {[0, 1, 2, 3].map((i) => (
              <SkeletonMemberRow key={i} />
            ))}
            <div className="mt-2" />
            {[0, 1].map((i) => (
              <SkeletonFeedItem key={`f${i}`} />
            ))}
          </>
        ) : (
        <>
        {beat && (
          <div
            className="shadow-brutal-sm"
            style={{
              borderRadius: 12,
              border: `2px solid ${t.border}`,
              background: t.primaryBg,
              padding: "10px 14px",
              fontFamily: t.fontBody,
              fontSize: 14,
              color: t.text,
              fontWeight: 500,
            }}
          >
            {beat.copy}
          </div>
        )}
        <div
          style={{
            fontFamily: t.font,
            fontWeight: 700,
            fontSize: 15,
            color: t.textMuted,
            textTransform: "lowercase",
            letterSpacing: 0.5,
          }}
        >
          progress
        </div>

        {members.map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-3 stagger-in"
            style={{
              borderRadius: 12,
              border: `2px solid ${m.isMe ? t.primary : t.border}`,
              background: m.isMe ? t.primaryBg : t.bgAlt,
              padding: "12px 14px",
              boxShadow: m.isMe ? `3px 3px 0 ${t.primary}` : t.shadowSm,
            }}
          >
            <span
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 20,
                width: 28,
                textAlign: "center",
              }}
            >
              {rankEmoji[i]}
            </span>
            <Avatar
              name={m.name}
              size={38}
              color={m.isMe ? t.primaryLight : undefined}
            />
            <div className="flex-1">
              <div
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 15,
                  color: t.text,
                }}
              >
                {m.name}
                {m.isMe ? " (you)" : ""}
                {m.isCreator && (
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
              {/* progress bar */}
              <div className="mt-1" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    background: t.border + "22",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, (m.done / m.target) * 100)}%`,
                      height: "100%",
                      borderRadius: 3,
                      background: m.done >= m.target ? t.positive : t.primary,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 16,
                  color: m.done >= m.target ? t.positive : t.text,
                }}
              >
                {m.done}/{m.target}
              </div>
              {m.done === 0 && (
                <div
                  style={{
                    fontFamily: t.fontBody,
                    fontSize: 11,
                    color: t.textMuted,
                  }}
                >
                  no logs yet
                </div>
              )}
            </div>
          </div>
        ))}

        <div
          className="mt-1"
          style={{
            fontFamily: t.font,
            fontWeight: 700,
            fontSize: 15,
            color: t.textMuted,
            textTransform: "lowercase",
            letterSpacing: 0.5,
          }}
        >
          activity feed
        </div>

        {feed.length === 0 ? (
          <EmptyState type="feed" />
        ) : [...feed]
            .sort((a, b) => b.logged_at.localeCompare(a.logged_at))
            .map((f) => <FeedCard key={f.id} item={f} />)}

        </>

        )}
      </div>

      {/* docked bottom — same pattern as create-circle, lobby, etc. */}
      <div className="px-5 pb-6 pt-3 shrink-0">
        <BigButton bg={t.positive} onClick={onLog} className="w-full">
          log today
        </BigButton>
      </div>

      {/* options menu (bottom sheet) */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center"
          style={{ background: "rgba(26, 10, 0, 0.45)" }}
          onClick={() => setMenuOpen(false)}
        >
          <div
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
              {canEdit && (
                <BigButton
                  bg={t.bgAlt}
                  onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                  className="w-full"
                >
                  edit the bet
                </BigButton>
              )}
              <BigButton
                bg={t.danger}
                onClick={() => { setMenuOpen(false); setShowLeaveConfirm(true); }}
                className="w-full"
              >
                leave circle
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

      {/* edit dialog (active circle — danger zone gates target/weeks) */}
      {circle && (
        <EditCircleDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          isActive={circle.status === "active"}
          onSave={async (data, opts) => {
            if (!circleId) return;
            if (opts.willReset) {
              await resetCircleProgress(circleId);
            }
            await updateCircle(circleId, data);
            await refresh();
            await loadFeed();
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
          minMaxMembers={Math.max(2, rawMembers.length)}
        />
      )}

      {/* leave confirmation overlay */}
      {showLeaveConfirm && (
        <div
          className="absolute inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(26, 10, 0, 0.4)" }}
        >
          <div
            className="shadow-brutal mx-6"
            style={{
              borderRadius: 16,
              border: `2px solid ${t.border}`,
              background: t.bg,
              padding: 24,
              maxWidth: 320,
              width: "100%",
            }}
          >
            <div
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 20,
                color: t.text,
                marginBottom: 8,
              }}
            >
              leave the circle?
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
              this counts as a loss. your remaining weeks will be marked as missed and any IOUs will activate. the circle will see you left.
            </div>
            <div className="flex flex-col gap-2">
              <BigButton
                bg={t.danger}
                onClick={() => {
                  setShowLeaveConfirm(false);
                  onLeave?.();
                }}
                className="w-full"
              >
                leave, i understand
              </BigButton>
              <BigButton
                bg={t.bgAlt}
                onClick={() => setShowLeaveConfirm(false)}
                className="w-full"
              >
                stay in the circle
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
