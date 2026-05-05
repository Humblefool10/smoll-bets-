"use client";

import { supabase } from "@/lib/supabase";

// minimal email format check. catches obvious typos (missing @, missing dot).
// not strict RFC 5321 — strict is hostile, this is friendly.
export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

// stores feedback for the maintainer to read later via the supabase dashboard.
// requires sign-in (the RLS policy enforces user_id = auth.uid()).
export async function submitFeedback(email: string, message: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("sign in to send feedback.");
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();
  if (!isValidEmail(trimmedEmail)) throw new Error("that email looks off — double check it?");
  if (trimmedMessage.length < 1) throw new Error("write a message first.");

  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    email: trimmedEmail,
    message: trimmedMessage,
  });
  if (error) throw error;
}

// hits the server-side delete route with the user's access token.
// on success, signs out locally to drop the stale session.
export async function deleteAccount(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("not signed in");

  const res = await fetch("/api/delete-account", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "couldn't delete account.");
  }

  await supabase.auth.signOut();
}
