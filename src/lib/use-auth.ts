"use client";

import { useState, useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// privacy-respecting user context: only the uuid, never email or name.
// enough to correlate errors to a person we can ask about it; not enough
// to leak identifying data into the error tracker.
function tagSentryUser(user: User | null) {
  Sentry.setUser(user ? { id: user.id } : null);
}

// ── auth hook ─────────────────────────────────────────────────────────────
//
// this hook does three things:
// 1. checks if someone is already logged in (page refresh)
// 2. listens for auth changes (login, logout, token refresh)
// 3. exposes login/logout functions
//
// every component that needs to know "who is this user?" uses this hook.

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      tagSentryUser(u);
      setLoading(false);
    });

    // listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        tagSentryUser(u);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}`,
      },
    });
    return { error };
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo ?? `${window.location.origin}`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signInWithEmail, signInWithGoogle, signOut };
}
