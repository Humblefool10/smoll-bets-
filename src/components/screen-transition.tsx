"use client";

// spatial navigation: screens slide in from the direction you're going.
// forward (deeper) = slide from right. back = slide from left.
// this creates a mental map — you know where you ARE because you traveled there.

export function ScreenTransition({
  children,
  direction = "forward",
}: {
  children: React.ReactNode;
  direction?: "forward" | "back";
}) {
  return (
    <div
      className={
        direction === "forward" ? "screen-enter-right" : "screen-enter-left"
      }
      style={{ height: "100%", width: "100%" }}
    >
      {children}
    </div>
  );
}
