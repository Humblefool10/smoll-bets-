import { supabase } from "@/lib/supabase";

// ── create a circle ───────────────────────────────────────────────────────
// inserts the circle + adds the creator as the first member.
// returns the circle data including the invite code.

export async function createCircle(data: {
  name: string;
  habit: string;
  target: number;
  durationWeeks: number;
  stakes: string;
  verification: "honor" | "proof" | "both";
  maxMembers: number;
}) {
  // get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");

  // insert circle
  const { data: circle, error: circleError } = await supabase
    .from("circles")
    .insert({
      name: data.name,
      habit: data.habit,
      target: data.target,
      duration_weeks: data.durationWeeks,
      stakes: data.stakes,
      verification: data.verification,
      max_members: data.maxMembers,
      created_by: user.id,
      status: "waiting",
    })
    .select()
    .single();

  if (circleError) throw circleError;

  // add creator as first member
  const { error: memberError } = await supabase
    .from("circle_members")
    .insert({
      circle_id: circle.id,
      user_id: user.id,
      role: "creator",
    });

  if (memberError) throw memberError;

  return circle;
}

// ── fetch a circle by invite code ─────────────────────────────────────────

export async function fetchCircleByInvite(inviteCode: string) {
  // uses security definer function to bypass RLS (invite pages need public access)
  const { data, error } = await supabase
    .rpc("get_circle_by_invite_with_members", { code: inviteCode });

  if (error || !data || data.length === 0) return null;

  // the function returns one row per member, so group them
  const first = data[0];
  const circle_members = data
    .filter((r: Record<string, unknown>) => r.member_user_id)
    .map((r: Record<string, unknown>) => ({
      user_id: r.member_user_id as string,
      role: r.member_role as string,
      joined_at: r.member_joined_at as string,
      left_at: r.member_left_at as string | null,
      profile: { display_name: r.member_display_name as string },
    }));

  return {
    id: first.id,
    name: first.name,
    habit: first.habit,
    target: first.target,
    duration_weeks: first.duration_weeks,
    stakes: first.stakes,
    verification: first.verification,
    max_members: first.max_members,
    status: first.status,
    invite_code: first.invite_code,
    started_at: first.started_at,
    created_at: first.created_at,
    circle_members,
  };
}

// ── update a circle (creator only, only while waiting) ───────────────────

export async function updateCircle(circleId: string, data: {
  name: string;
  habit: string;
  target: number;
  durationWeeks: number;
  stakes: string;
  verification: "honor" | "proof" | "both";
  maxMembers: number;
}) {
  const { error } = await supabase
    .from("circles")
    .update({
      name: data.name,
      habit: data.habit,
      target: data.target,
      duration_weeks: data.durationWeeks,
      stakes: data.stakes,
      verification: data.verification,
      max_members: data.maxMembers,
    })
    .eq("id", circleId)
    .eq("status", "waiting");

  if (error) throw error;
}

// ── delete a circle (creator only) ───────────────────────────────────────
// cascades to circle_members, logs, settlements via FK constraints.

export async function deleteCircle(circleId: string) {
  const { error } = await supabase
    .from("circles")
    .delete()
    .eq("id", circleId);

  if (error) throw error;
}

// ── join a circle ─────────────────────────────────────────────────────────

export async function joinCircle(circleId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");

  const { error } = await supabase
    .from("circle_members")
    .insert({
      circle_id: circleId,
      user_id: user.id,
      role: "member",
    });

  if (error) throw error;
}

// ── start a circle (creator only) ────────────────────────────────────────

export async function startCircle(circleId: string) {
  const { error } = await supabase
    .from("circles")
    .update({
      status: "active",
      started_at: new Date().toISOString(),
    })
    .eq("id", circleId);

  if (error) throw error;
}

// ── leave a circle ────────────────────────────────────────────────────────

export async function leaveCircle(circleId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");

  const { error } = await supabase
    .from("circle_members")
    .update({ left_at: new Date().toISOString() })
    .eq("circle_id", circleId)
    .eq("user_id", user.id);

  if (error) throw error;
}

// ── upload proof photo ────────────────────────────────────────────────────

export async function uploadProofPhoto(circleId: string, file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${circleId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("proof-photos")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("proof-photos")
    .getPublicUrl(path);

  return data.publicUrl;
}

// ── log a habit ───────────────────────────────────────────────────────────

export async function logHabit(data: {
  circleId: string;
  type: "honor" | "photo";
  photoUrl?: string;
  note?: string;
  weekNumber: number;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");

  const { error } = await supabase
    .from("logs")
    .insert({
      circle_id: data.circleId,
      user_id: user.id,
      type: data.type,
      photo_url: data.photoUrl,
      note: data.note,
      week_number: data.weekNumber,
    });

  if (error) throw error;
}

// ── settlement: the reckoning ─────────────────────────────────────────────
// checks if a circle has expired. if so, calculates results and writes
// the settlement. win target = target × duration_weeks.


export interface SettlementResult {
  user_id: string;
  display_name: string;
  total_logs: number;
  won: boolean;
}

export interface Settlement {
  outcome: "all-clear" | "someone-owes" | "nobody-showed";
  results: SettlementResult[];
  win_target: number;
  circle: {
    name: string;
    habit: string;
    stakes: string;
    target: number;
    duration_weeks: number;
  };
}

export async function checkAndSettle(circleId: string): Promise<Settlement | null> {
  // fetch the circle
  const { data: circle } = await supabase
    .from("circles")
    .select("*")
    .eq("id", circleId)
    .single();

  if (!circle || circle.status !== "active" || !circle.started_at) return null;

  // check if expired
  const start = new Date(circle.started_at);
  const end = new Date(start.getTime() + circle.duration_weeks * 7 * 24 * 60 * 60 * 1000);
  if (new Date() < end) return null; // not expired yet

  // check if already settled
  const { data: existing } = await supabase
    .from("settlements")
    .select("*")
    .eq("circle_id", circleId)
    .eq("week_number", circle.duration_weeks)
    .maybeSingle();

  if (existing) {
    // already settled, just return the results
    return {
      outcome: existing.outcome as Settlement["outcome"],
      results: existing.results as SettlementResult[],
      win_target: circle.target * circle.duration_weeks,
      circle: {
        name: circle.name,
        habit: circle.habit,
        stakes: circle.stakes,
        target: circle.target,
        duration_weeks: circle.duration_weeks,
      },
    };
  }

  // get all active members
  const { data: members } = await supabase
    .from("circle_members")
    .select("user_id, profile:profiles(display_name)")
    .eq("circle_id", circleId)
    .is("left_at", null);

  if (!members || members.length === 0) return null;

  // count logs per member
  const { data: logs } = await supabase
    .from("logs")
    .select("user_id")
    .eq("circle_id", circleId);

  const logCounts: Record<string, number> = {};
  logs?.forEach((l) => {
    logCounts[l.user_id] = (logCounts[l.user_id] || 0) + 1;
  });

  // calculate results
  const results: SettlementResult[] = members.map((m: Record<string, unknown>) => {
    const totalLogs = logCounts[m.user_id as string] || 0;
    return {
      user_id: m.user_id as string,
      display_name: (m.profile as { display_name: string })?.display_name || "unknown",
      total_logs: totalLogs,
      won: totalLogs >= circle.target * circle.duration_weeks,
    };
  });

  // sort: winners first, then by log count
  results.sort((a, b) => {
    if (a.won !== b.won) return a.won ? -1 : 1;
    return b.total_logs - a.total_logs;
  });

  const allWon = results.every((r) => r.won);
  const noneWon = results.every((r) => !r.won);
  const outcome: Settlement["outcome"] = allWon
    ? "all-clear"
    : noneWon
    ? "nobody-showed"
    : "someone-owes";

  // write settlement
  await supabase.from("settlements").insert({
    circle_id: circleId,
    week_number: circle.duration_weeks,
    outcome,
    results,
  });

  // mark circle as completed
  await supabase
    .from("circles")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", circleId);

  return {
    outcome,
    results,
    win_target: circle.target * circle.duration_weeks,
    circle: {
      name: circle.name,
      habit: circle.habit,
      stakes: circle.stakes,
      target: circle.target,
      duration_weeks: circle.duration_weeks,
    },
  };
}

// fetch existing settlement for a completed circle
export async function fetchSettlement(circleId: string): Promise<Settlement | null> {
  const { data: circle } = await supabase
    .from("circles")
    .select("name, habit, stakes, target, duration_weeks")
    .eq("id", circleId)
    .single();

  if (!circle) return null;

  const { data: settlement } = await supabase
    .from("settlements")
    .select("*")
    .eq("circle_id", circleId)
    .order("week_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!settlement) return null;

  return {
    outcome: settlement.outcome as Settlement["outcome"],
    results: settlement.results as SettlementResult[],
    win_target: circle.target * circle.duration_weeks,
    circle: {
      name: circle.name,
      habit: circle.habit,
      stakes: circle.stakes,
      target: circle.target,
      duration_weeks: circle.duration_weeks,
    },
  };
}

// ── activity feed ────────────────────────────────────────────────────────
// fetches recent logs for a circle with profile names

export interface FeedItem {
  id: string;
  user_id: string;
  display_name: string;
  type: "honor" | "photo";
  note: string | null;
  photo_url: string | null;
  logged_at: string;
}

export async function fetchCircleFeed(circleId: string, limit = 20): Promise<FeedItem[]> {
  const { data, error } = await supabase
    .from("logs")
    .select("id, user_id, type, note, photo_url, logged_at, profile:profiles(display_name)")
    .eq("circle_id", circleId)
    .order("logged_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((l: Record<string, unknown>) => ({
    id: l.id as string,
    user_id: l.user_id as string,
    display_name: (l.profile as { display_name: string })?.display_name || "unknown",
    type: l.type as "honor" | "photo",
    note: l.note as string | null,
    photo_url: (l.photo_url as string | null) ?? null,
    logged_at: l.logged_at as string,
  }));
}

// returns the current user's log for today in this circle, or null.
// uses the same date boundary as the unique index (logged_at::date).
export async function fetchTodaysLog(circleId: string): Promise<FeedItem | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("logs")
    .select("id, user_id, type, note, photo_url, logged_at, profile:profiles(display_name)")
    .eq("circle_id", circleId)
    .eq("user_id", user.id)
    .gte("logged_at", startOfDay.toISOString())
    .order("logged_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const l = data as Record<string, unknown>;
  return {
    id: l.id as string,
    user_id: l.user_id as string,
    display_name: (l.profile as { display_name: string })?.display_name || "unknown",
    type: l.type as "honor" | "photo",
    note: l.note as string | null,
    photo_url: (l.photo_url as string | null) ?? null,
    logged_at: l.logged_at as string,
  };
}

// wipes all logs and resets started_at to now. used when the creator changes
// target / duration_weeks on an active circle — those govern the win threshold,
// so progress has to restart from zero for everyone.
export async function resetCircleProgress(circleId: string) {
  const { error: delErr } = await supabase
    .from("logs")
    .delete()
    .eq("circle_id", circleId);
  if (delErr) throw delErr;

  const { error: updErr } = await supabase
    .from("circles")
    .update({ started_at: new Date().toISOString() })
    .eq("id", circleId);
  if (updErr) throw updErr;
}

// ── profile stats ────────────────────────────────────────────────────────

export interface ProfileStats {
  total: number;
  active: number;
  won: number;
  lost: number;
}

export async function fetchProfileStats(): Promise<ProfileStats> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { total: 0, active: 0, won: 0, lost: 0 };

  // get all circles the user is/was a member of
  const { data: memberships } = await supabase
    .from("circle_members")
    .select("circle_id")
    .eq("user_id", user.id)
    .is("left_at", null);

  if (!memberships || memberships.length === 0) {
    return { total: 0, active: 0, won: 0, lost: 0 };
  }

  const circleIds = memberships.map((m) => m.circle_id);

  const { data: circles } = await supabase
    .from("circles")
    .select("id, status")
    .in("id", circleIds);

  if (!circles) return { total: 0, active: 0, won: 0, lost: 0 };

  const active = circles.filter((c) => c.status === "active" || c.status === "waiting").length;
  const completedIds = circles.filter((c) => c.status === "completed").map((c) => c.id);

  let won = 0;
  let lost = 0;

  if (completedIds.length > 0) {
    // check settlements for win/loss
    const { data: settlements } = await supabase
      .from("settlements")
      .select("results")
      .in("circle_id", completedIds);

    settlements?.forEach((s) => {
      const results = s.results as SettlementResult[];
      const myResult = results.find((r) => r.user_id === user.id);
      if (myResult) {
        if (myResult.won) won++;
        else lost++;
      }
    });
  }

  return {
    total: circles.length,
    active,
    won,
    lost,
  };
}

// ── bet history ──────────────────────────────────────────────────────────

export interface BetHistoryItem {
  circle_id: string;
  circle_name: string;
  habit: string;
  stakes: string;
  duration_weeks: number;
  outcome: "all-clear" | "someone-owes" | "nobody-showed";
  my_result: "won" | "lost";
  results: SettlementResult[];
}

export async function fetchBetHistory(): Promise<BetHistoryItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // get completed circles user was in
  const { data: memberships } = await supabase
    .from("circle_members")
    .select("circle_id")
    .eq("user_id", user.id)
    .is("left_at", null);

  if (!memberships || memberships.length === 0) return [];

  const circleIds = memberships.map((m) => m.circle_id);

  const { data: circles } = await supabase
    .from("circles")
    .select("id, name, habit, stakes, duration_weeks, status")
    .in("id", circleIds)
    .eq("status", "completed");

  if (!circles || circles.length === 0) return [];

  const { data: settlements } = await supabase
    .from("settlements")
    .select("circle_id, outcome, results")
    .in("circle_id", circles.map((c) => c.id));

  if (!settlements) return [];

  const settlementMap: Record<string, typeof settlements[0]> = {};
  settlements.forEach((s) => { settlementMap[s.circle_id] = s; });

  return circles
    .filter((c) => settlementMap[c.id])
    .map((c) => {
      const s = settlementMap[c.id];
      const results = s.results as SettlementResult[];
      const myResult = results.find((r) => r.user_id === user.id);
      return {
        circle_id: c.id,
        circle_name: c.name,
        habit: c.habit,
        stakes: c.stakes,
        duration_weeks: c.duration_weeks,
        outcome: s.outcome as BetHistoryItem["outcome"],
        my_result: (myResult?.won ? "won" : "lost") as "won" | "lost",
        results,
      };
    });
}

