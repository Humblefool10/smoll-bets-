"use client";

import { useState } from "react";
import { SplashScreen } from "@/components/screens/splash";
import { AuthScreen } from "@/components/screens/auth";
import { HomeEmptyScreen } from "@/components/screens/home-empty";
import { HomeScreen } from "@/components/screens/home";
import { CreateCircleFlow } from "@/components/screens/create-circle";
import { CircleLobbyScreen } from "@/components/screens/circle-lobby";
import { CircleScreen } from "@/components/screens/circle";
import { LogScreen } from "@/components/screens/log";
import { ProfileScreen } from "@/components/screens/profile";

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
  const [hasCircles, setHasCircles] = useState(false);
  const [createdCircle, setCreatedCircle] = useState<CreatedCircle | null>(
    null
  );

  return (
    <div className="h-full w-full max-w-[430px] mx-auto relative overflow-hidden">
      {screen === "splash" && (
        <SplashScreen onContinue={() => setScreen("auth")} />
      )}
      {screen === "auth" && (
        <AuthScreen
          onAuth={() => setScreen(hasCircles ? "home" : "home-empty")}
        />
      )}
      {screen === "home-empty" && (
        <HomeEmptyScreen
          onCreateCircle={() => setScreen("create-circle")}
          onProfileTap={() => setScreen("profile")}
        />
      )}
      {screen === "create-circle" && (
        <CreateCircleFlow
          onCancel={() =>
            setScreen(hasCircles ? "home" : "home-empty")
          }
          onDone={(data) => {
            setCreatedCircle(data);
            setScreen("circle-lobby");
          }}
        />
      )}
      {screen === "circle-lobby" && (
        <CircleLobbyScreen
          onBack={() => {
            setHasCircles(true);
            setScreen("home");
          }}
          onStart={() => {
            setHasCircles(true);
            setScreen("circle");
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
          onCircleTap={() => setScreen("circle")}
          onProfileTap={() => setScreen("profile")}
          onCreateCircle={() => setScreen("create-circle")}
        />
      )}
      {screen === "circle" && (
        <CircleScreen
          onBack={() => setScreen("home")}
          onLog={() => setScreen("log")}
        />
      )}
      {screen === "log" && (
        <LogScreen onBack={() => setScreen("circle")} />
      )}
      {screen === "profile" && (
        <ProfileScreen onBack={() => setScreen("home")} />
      )}
    </div>
  );
}
