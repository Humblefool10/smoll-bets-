"use client";

import { t } from "@/lib/tokens";

export function BackButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="go back"
      className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fd8834] bg-transparent border-none p-0"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke={t.text}
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M12 4L6 10l6 6" />
      </svg>
    </button>
  );
}
