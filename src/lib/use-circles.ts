"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Circle {
  id: string;
  name: string;
  habit: string;
  target: number;
  duration_weeks: number;
  stakes: string;
  verification: "honor" | "proof" | "both";
  max_members: number;
  status: "waiting" | "active" | "completed";
  invite_code: string;
  started_at: string | null;
  created_at: string;
  created_by: string;
}

export interface CircleWithRole extends Circle {
  role: "creator" | "member";
  member_count: number;
}

export function useMyCircles() {
  const [circles, setCircles] = useState<CircleWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // get circles I'm a member of
    const { data: memberships } = await supabase
      .from("circle_members")
      .select("circle_id, role")
      .eq("user_id", user.id)
      .is("left_at", null);

    if (!memberships || memberships.length === 0) {
      setCircles([]);
      setLoading(false);
      return;
    }

    const circleIds = memberships.map((m) => m.circle_id);

    // get circle details
    const { data: circlesData } = await supabase
      .from("circles")
      .select("*")
      .in("id", circleIds);

    if (!circlesData) {
      setCircles([]);
      setLoading(false);
      return;
    }

    // get member counts
    const { data: memberCounts } = await supabase
      .from("circle_members")
      .select("circle_id")
      .in("circle_id", circleIds)
      .is("left_at", null);

    const countMap: Record<string, number> = {};
    memberCounts?.forEach((m) => {
      countMap[m.circle_id] = (countMap[m.circle_id] || 0) + 1;
    });

    const roleMap: Record<string, string> = {};
    memberships.forEach((m) => {
      roleMap[m.circle_id] = m.role;
    });

    const result: CircleWithRole[] = circlesData.map((c) => ({
      ...c,
      role: (roleMap[c.id] || "member") as "creator" | "member",
      member_count: countMap[c.id] || 0,
    }));

    setCircles(result);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { circles, loading, refresh };
}

// hook for a single circle with its members
export interface CircleMember {
  user_id: string;
  role: "creator" | "member";
  joined_at: string;
  left_at: string | null;
  display_name: string;
}

export function useCircleDetail(circleId: string | null) {
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!circleId) { setLoading(false); return; }

    const { data: circleData } = await supabase
      .from("circles")
      .select("*")
      .eq("id", circleId)
      .single();

    if (circleData) setCircle(circleData);

    const { data: memberData } = await supabase
      .from("circle_members")
      .select("user_id, role, joined_at, left_at, profile:profiles(display_name)")
      .eq("circle_id", circleId)
      .is("left_at", null);

    if (memberData) {
      setMembers(
        memberData.map((m: Record<string, unknown>) => ({
          user_id: m.user_id as string,
          role: m.role as "creator" | "member",
          joined_at: m.joined_at as string,
          left_at: m.left_at as string | null,
          display_name: (m.profile as { display_name: string })?.display_name || "unknown",
        }))
      );
    }

    setLoading(false);
  }, [circleId]);

  useEffect(() => { refresh(); }, [refresh]);

  // realtime: refetch when this circle's row or its membership changes
  useEffect(() => {
    if (!circleId) return;
    const channel = supabase
      .channel(`circle:${circleId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "circles", filter: `id=eq.${circleId}` },
        () => { refresh(); }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "circle_members", filter: `circle_id=eq.${circleId}` },
        () => { refresh(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [circleId, refresh]);

  return { circle, members, loading, refresh };
}
