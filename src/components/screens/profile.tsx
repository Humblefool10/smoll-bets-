"use client";

import { useState, useEffect } from "react";
import { t } from "@/lib/tokens";
import { Avatar } from "@/components/avatar";
import { Pill } from "@/components/pill";
import { BigButton } from "@/components/big-button";

import { BackButton } from "@/components/back-button";
import { SkeletonBar, SkeletonCircle, LoadingText } from "@/components/loading";
import { EmptyState } from "@/components/empty-state";
import { useProfile } from "@/lib/use-profile";
import { fetchProfileStats, fetchBetHistory } from "@/lib/circles";
import type { ProfileStats, BetHistoryItem } from "@/lib/circles";

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
  const [stats, setStats] = useState<ProfileStats>({ total: 0, active: 0, won: 0, lost: 0 });
  const [betHistory, setBetHistory] = useState<BetHistoryItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const loading = profileLoading || dataLoading;

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
          <div
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 22,
              color: t.text,
            }}
          >
            profile
          </div>
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
                  fontSize: 11,
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
          <div
            className="mb-2"
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 15,
              color: t.textMuted,
            }}
          >
            active IOUs
          </div>
          <EmptyState type="ious" />
        </div>

        {/* bet history — your track record */}
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
            bet history
          </div>

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

      <div className="px-5 pb-6 pt-3 shrink-0">
        <BigButton bg={t.bgAlt} onClick={onSignOut} className="w-full">
          sign out
        </BigButton>
      </div>
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </div>
  );
}
