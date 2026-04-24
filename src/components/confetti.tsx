"use client";

import { useEffect, useState } from "react";

// ── confetti burst ─────────────────────────────────────────────────────────
// pure CSS. no canvas, no dependencies.
// triggered on commitment moments: "i'm in", "bet accepted", "logged."
// peak-end rule: the celebration IS the memory.

const COLORS = ["#fd8834", "#c400a2", "#28c76a", "#ffd0a8", "#ffe0f9", "#f34e4e"];

interface Piece {
  id: number;
  left: string;
  color: string;
  duration: string;
  delay: string;
  size: number;
  shape: "square" | "circle" | "strip";
}

function generatePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    duration: `${1.8 + Math.random() * 1.5}s`,
    delay: `${Math.random() * 0.4}s`,
    size: 6 + Math.random() * 8,
    shape: (["square", "circle", "strip"] as const)[Math.floor(Math.random() * 3)],
  }));
}

export function Confetti({ count = 40 }: { count?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setPieces(generatePieces(count));
    const timer = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(timer);
  }, [count]);

  if (!visible || pieces.length === 0) return null;

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            background: p.color,
            width: p.shape === "strip" ? p.size * 0.4 : p.size,
            height: p.shape === "strip" ? p.size * 1.8 : p.size,
            borderRadius: p.shape === "circle" ? "50%" : 2,
            ["--fall-duration" as string]: p.duration,
            ["--fall-delay" as string]: p.delay,
          }}
        />
      ))}
    </>
  );
}
