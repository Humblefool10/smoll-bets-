"use client";

import { useState, useCallback } from "react";
import { SplashScreen } from "@/components/screens/splash";
import { AuthScreen } from "@/components/screens/auth";
import { HomeEmptyScreen } from "@/components/screens/home-empty";
import { HomeScreen } from "@/components/screens/home";
import { CreateCircleFlow } from "@/components/screens/create-circle";
import { CircleLobbyScreen } from "@/components/screens/circle-lobby";
import { CircleScreen } from "@/components/screens/circle";
import { LogScreen } from "@/components/screens/log";
import { ProfileScreen } from "@/components/screens/profile";
import { ScreenTransition } from "@/components/screen-transition";

type Screen =
  | "splash"
  | "auth"
  | "home-empty"
  | "home"
  | "create-circle"
  | "circle-lobby"
  | "circle"
  | "log"
  | "profile";

// back navigations — these slide from the left
const BACK_TRANSITIONS = new Set([
  "circle->home",
  "log->circle",
  "profile->home",
  "home-empty->splash",
  "circle-lobby->home",
  "create-circle->home",
  "create-circle->home-empty",
]);

interface CreatedCircle {
  name: string;
  habit: string;
  target: string;
  duration: string;
  stakes: string;
  verification: "honor" | "proof";
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [transitionKey, setTransitionKey] = useState(0);
  const [hasCircles, setHasCircles] = useState(false);
  const [createdCircle, setCreatedCircle] = useState<CreatedCircle | null>(
    null
  );

  const go = useCallback(
    (to: Screen) => {
      const key = `${screen}->${to}`;
      setDirection(BACK_TRANSITIONS.has(key) ? "back" : "forward");
      setTransitionKey((k) => k + 1);
      setScreen(to);
    },
    [screen]
  );

  return (
    <div className="h-full w-full max-w-[430px] mx-auto relative overflow-hidden">
      <ScreenTransition key={transitionKey} direction={direction}>
        {screen === "splash" && (
          <SplashScreen onContinue={() => go("auth")} />
        )}
        {screen === "auth" && (
          <AuthScreen
            onAuth={() => go(hasCircles ? "home" : "home-empty")}
          />
        )}
        {screen === "home-empty" && (
          <HomeEmptyScreen
            onCreateCircle={() => go("create-circle")}
            onProfileTap={() => go("profile")}
          />
        )}
        {screen === "create-circle" && (
          <CreateCircleFlow
            onCancel={() =>
              go(hasCircles ? "home" : "home-empty")
            }
            onDone={(data) => {
              setCreatedCircle(data);
              go("circle-lobby");
            }}
          />
        )}
        {screen === "circle-lobby" && (
          <CircleLobbyScreen
            onBack={() => {
              setHasCircles(true);
              go("home");
            }}
            onStart={() => {
              setHasCircles(true);
              go("circle");
            }}
            circleName={createdCircle?.name}
            habit={
              createdCircle
                ? `${createdCircle.habit} ${createdCircle.target}x per week`
                : undefined
            }
            duration={createdCircle?.duration}
            stakes={createdCircle?.stakes}
            verification={createdCircle?.verification}
          />
        )}
        {screen === "home" && (
          <HomeScreen
            onCircleTap={() => go("circle")}
            onProfileTap={() => go("profile")}
            onCreateCircle={() => go("create-circle")}
          />
        )}
        {screen === "circle" && (
          <CircleScreen
            onBack={() => go("home")}
            onLog={() => go("log")}
          />
        )}
        {screen === "log" && (
          <LogScreen onBack={() => go("circle")} />
        )}
        {screen === "profile" && (
          <ProfileScreen onBack={() => go("home")} />
        )}
      </ScreenTransition>
    </div>
  );
}
