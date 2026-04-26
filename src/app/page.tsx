"use client";

import { useState, useCallback, useEffect } from "react";
import { SplashScreen } from "@/components/screens/splash";
import { AuthScreen } from "@/components/screens/auth";
import { HomeEmptyScreen } from "@/components/screens/home-empty";
import { HomeScreen } from "@/components/screens/home";
import { CreateCircleFlow } from "@/components/screens/create-circle";
import { CircleLobbyScreen } from "@/components/screens/circle-lobby";
import { CircleScreen } from "@/components/screens/circle";
import { LogScreen } from "@/components/screens/log";
import { ProfileScreen } from "@/components/screens/profile";
import { CircleCompletedScreen } from "@/components/screens/circle-completed";
import { ScreenTransition } from "@/components/screen-transition";
import { LoadingScreen } from "@/components/loading";
import { useAuth } from "@/lib/use-auth";
import { useMyCircles } from "@/lib/use-circles";
import { useProfile } from "@/lib/use-profile";
import { startCircle, leaveCircle } from "@/lib/circles";

type Screen =
  | "loading"
  | "splash"
  | "auth"
  | "home-empty"
  | "home"
  | "create-circle"
  | "circle-lobby"
  | "circle"
  | "log"
  | "profile"
  | "circle-completed";

const BACK_TRANSITIONS = new Set([
  "circle->home",
  "log->circle",
  "profile->home",
  "home-empty->splash",
  "circle-lobby->home",
  "create-circle->home",
  "create-circle->home-empty",
  "circle-completed->home",
]);

export default function App() {
  const { user, loading: authLoading, signInWithEmail, signInWithGoogle } = useAuth();
  const { profile } = useProfile();
  const { circles, loading: circlesLoading, refresh: refreshCircles } = useMyCircles();
  const [screen, setScreen] = useState<Screen>("loading");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [transitionKey, setTransitionKey] = useState(0);
  const [currentCircleId, setCurrentCircleId] = useState<string | null>(null);

  const [authResolved, setAuthResolved] = useState(false);

  // if user lands here with a pending invite, redirect to the invite page
  useEffect(() => {
    if (!user || authLoading) return;
    const pending = localStorage.getItem("pendingInvite");
    if (pending) {
      localStorage.removeItem("pendingInvite");
      window.location.href = `/invite/${pending}`;
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (authLoading || circlesLoading) return;

    if (!authResolved) {
      if (user) {
        setScreen(circles.length > 0 ? "home" : "home-empty");
      } else {
        setScreen("splash");
      }
      setAuthResolved(true);
      return;
    }

    if (user && (screen === "auth" || screen === "splash")) {
      setScreen(circles.length > 0 ? "home" : "home-empty");
    } else if (!user && screen !== "splash" && screen !== "auth") {
      setScreen("splash");
    }
  }, [authLoading, circlesLoading, user, authResolved, circles.length, screen]);

  const go = useCallback(
    (to: Screen) => {
      const key = `${screen}->${to}`;
      setDirection(BACK_TRANSITIONS.has(key) ? "back" : "forward");
      setTransitionKey((k) => k + 1);
      setScreen(to);
    },
    [screen]
  );

  if (screen === "loading") {
    return (
      <div className="h-full w-full max-w-[430px] mx-auto relative overflow-hidden">
        <LoadingScreen />
      </div>
    );
  }

  const displayName = profile?.display_name || "friend";

  return (
    <div className="h-full w-full max-w-[430px] mx-auto relative overflow-hidden">
      <ScreenTransition key={transitionKey} direction={direction}>
        {screen === "splash" && (
          <SplashScreen
            onContinue={() => go("auth")}
            onSignIn={() => go("auth")}
          />
        )}
        {screen === "auth" && (
          <AuthScreen
            onAuth={() => go(circles.length > 0 ? "home" : "home-empty")}
            onSignInWithEmail={signInWithEmail}
            onSignInWithGoogle={signInWithGoogle}
          />
        )}
        {screen === "home-empty" && (
          <HomeEmptyScreen
            displayName={displayName}
            onCreateCircle={() => go("create-circle")}
            onProfileTap={() => go("profile")}
          />
        )}
        {screen === "create-circle" && (
          <CreateCircleFlow
            onCancel={() =>
              go(circles.length > 0 ? "home" : "home-empty")
            }
            onDone={async (circleId) => {
              setCurrentCircleId(circleId);
              await refreshCircles();
              go("circle-lobby");
            }}
          />
        )}
        {screen === "circle-lobby" && (
          <CircleLobbyScreen
            circleId={currentCircleId}
            onBack={() => go("home")}
            onStart={async () => {
              if (currentCircleId) {
                try {
                  await startCircle(currentCircleId);
                  await refreshCircles();
                } catch (err) {
                  console.error("failed to start circle:", err);
                }
              }
              go("circle");
            }}
            onDelete={async () => {
              await refreshCircles();
              setCurrentCircleId(null);
              go("home");
            }}
          />
        )}
        {screen === "home" && (
          <HomeScreen
            displayName={displayName}
            circles={circles}
            onCircleTap={(id) => {
              setCurrentCircleId(id);
              const c = circles.find((c) => c.id === id);
              if (c?.status === "waiting") {
                go("circle-lobby");
              } else {
                go("circle");
              }
            }}
            onProfileTap={() => go("profile")}
            onCreateCircle={() => go("create-circle")}
          />
        )}
        {screen === "circle" && (
          <CircleScreen
            circleId={currentCircleId}
            onBack={() => go("home")}
            onLog={() => go("log")}
            onCompleted={() => go("circle-completed")}
            onLeave={async () => {
              if (currentCircleId) {
                try {
                  await leaveCircle(currentCircleId);
                  await refreshCircles();
                } catch (err) {
                  console.error("failed to leave circle:", err);
                }
              }
              go("home");
            }}
          />
        )}
        {screen === "log" && (
          <LogScreen
            circleId={currentCircleId}
            onBack={() => go("circle")}
          />
        )}
        {screen === "circle-completed" && (
          <CircleCompletedScreen
            circleId={currentCircleId}
            onBack={() => go("home")}
            onRunItBack={() => go("create-circle")}
          />
        )}
        {screen === "profile" && (
          <ProfileScreen
            onBack={() => go("home")}
            onSignOut={async () => {
              const { supabase } = await import("@/lib/supabase");
              await supabase.auth.signOut();
            }}
          />
        )}
      </ScreenTransition>
    </div>
  );
}
