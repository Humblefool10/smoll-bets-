"use client";

import { t } from "@/lib/tokens";

export function StatusBar() {
  return (
    <div
      className="flex items-center justify-between shrink-0"
      style={{ height: 44, padding: "0 24px" }}
    >
      <span
        style={{
          fontFamily: t.font,
          fontWeight: 700,
          fontSize: 15,
          color: t.text,
        }}
      >
        9:41
      </span>
      <div className="flex gap-[6px] items-center">
        <svg width="17" height="12" viewBox="0 0 17 12" fill={t.text}>
          <rect x="0" y="3" width="3" height="9" rx="1" />
          <rect x="4.5" y="2" width="3" height="10" rx="1" />
          <rect x="9" y="0.5" width="3" height="11.5" rx="1" />
          <rect x="13.5" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill={t.text}>
          <path d="M8 2.5C10.5 2.5 12.7 3.6 14.2 5.3L15.5 4C13.6 1.9 11 0.5 8 0.5C5 0.5 2.4 1.9 0.5 4L1.8 5.3C3.3 3.6 5.5 2.5 8 2.5Z" />
          <path d="M8 5.5C9.7 5.5 11.2 6.2 12.3 7.3L13.6 6C12.1 4.6 10.1 3.7 8 3.7C5.9 3.7 3.9 4.6 2.4 6L3.7 7.3C4.8 6.2 6.3 5.5 8 5.5Z" />
          <circle cx="8" cy="11" r="1.5" />
        </svg>
        <div className="flex items-center gap-[2px]">
          <div
            className="flex items-center"
            style={{
              width: 25,
              height: 12,
              borderRadius: 3,
              border: `1.5px solid ${t.text}`,
              padding: 2,
            }}
          >
            <div
              style={{
                width: "80%",
                height: "100%",
                background: t.text,
                borderRadius: 1,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
