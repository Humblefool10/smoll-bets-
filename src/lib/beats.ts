// ritual moment cards (Tier 2). pure derivation from circle + member data.
// no schema, no realtime — beats compute on read. read-only by design:
// the card witnesses the moment, you don't act on it.
//
// priority order matters because only one beat shows at a time. final-push
// is the most time-sensitive and outranks midpoint; midpoint outranks
// initiation; stumble is the catch-all when no scheduled beat is active.

export type RitualBeatType = "initiation" | "midpoint" | "stumble" | "final";

export interface RitualBeat {
  type: RitualBeatType;
  copy: string;
}

interface CircleForBeats {
  status: "waiting" | "active" | "completed";
  started_at: string | null;
  duration_weeks: number;
  target: number;
}

interface MemberPace {
  // total logs the member has put down so far in this circle
  logCount: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export function currentRitualBeat(
  circle: CircleForBeats,
  members: MemberPace[],
): RitualBeat | null {
  if (circle.status !== "active" || !circle.started_at) return null;

  const start = new Date(circle.started_at).getTime();
  const totalMs = circle.duration_weeks * WEEK_MS;
  const end = start + totalMs;
  const now = Date.now();
  const elapsed = now - start;
  const remaining = end - now;

  // FINAL PUSH — last 7 days. takes priority over everything time-based.
  if (remaining <= 7 * DAY_MS && remaining > 0) {
    const daysLeft = Math.max(1, Math.ceil(remaining / DAY_MS));
    return {
      type: "final",
      copy: `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left. show up.`,
    };
  }

  // MID-PASSAGE — ±3 days around the midpoint.
  const midpoint = totalMs / 2;
  const distFromMid = Math.abs(elapsed - midpoint);
  if (distFromMid <= 3 * DAY_MS) {
    const weeksLeft = Math.max(1, Math.ceil(remaining / WEEK_MS));
    return {
      type: "midpoint",
      copy: `halfway. ${weeksLeft} ${weeksLeft === 1 ? "week" : "weeks"} to go.`,
    };
  }

  // INITIATION — first 48h.
  if (elapsed <= 2 * DAY_MS) {
    return {
      type: "initiation",
      copy: "day one. show up when you can.",
    };
  }

  // STUMBLE — anyone falling behind their expected pace. anonymous by design.
  // pace = weeks_elapsed * target (rounded down — partial weeks don't yet
  // demand the full quota). card surfaces if at least one member has fewer.
  const weeksElapsed = Math.floor(elapsed / WEEK_MS);
  if (weeksElapsed >= 1) {
    const expected = weeksElapsed * circle.target;
    const someoneBehind = members.some((m) => m.logCount < expected);
    if (someoneBehind) {
      return {
        type: "stumble",
        copy: "first stumble. circle holds.",
      };
    }
  }

  return null;
}

// home-screen narrative cue. circle-data only — no member queries — so it
// stays cheap when rendering N circles. ALWAYS returns something so the
// pill on the home card is never empty.

interface CircleForCue {
  status: "waiting" | "active" | "completed";
  started_at: string | null;
  duration_weeks: number;
  member_count: number;
  max_members: number;
}

export function narrativeCue(circle: CircleForCue): string {
  if (circle.status === "waiting") {
    return `${circle.member_count}/${circle.max_members} in. waiting for more.`;
  }

  if (circle.status === "completed") {
    return "settled.";
  }

  // active
  if (!circle.started_at) return "active.";

  const start = new Date(circle.started_at).getTime();
  const totalMs = circle.duration_weeks * WEEK_MS;
  const end = start + totalMs;
  const now = Date.now();
  const elapsed = now - start;
  const remaining = end - now;

  // final 7 days
  if (remaining <= 7 * DAY_MS && remaining > 0) {
    const daysLeft = Math.max(1, Math.ceil(remaining / DAY_MS));
    return `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left.`;
  }

  // halfway window (±3 days)
  const midpoint = totalMs / 2;
  if (Math.abs(elapsed - midpoint) <= 3 * DAY_MS) {
    return "halfway through.";
  }

  // first 3 days
  if (elapsed <= 3 * DAY_MS) {
    const day = Math.max(1, Math.floor(elapsed / DAY_MS) + 1);
    return `day ${day}. just begun.`;
  }

  // generic mid-circle
  const weekNumber = Math.max(1, Math.floor(elapsed / WEEK_MS) + 1);
  return `week ${weekNumber} of ${circle.duration_weeks}.`;
}
