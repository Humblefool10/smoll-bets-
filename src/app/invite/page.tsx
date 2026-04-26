"use client";

import { t } from "@/lib/tokens";
import { BigButton } from "@/components/big-button";
import { ErrorState } from "@/components/error-state";

export default function InvitePageNoCode() {
  return (
    <div className="h-full w-full max-w-[430px] mx-auto relative overflow-hidden">
      <div
        className="flex flex-col h-full items-center justify-center px-6 gap-4"
        style={{ background: t.bg }}
      >
        <ErrorState type="notFound" />
        <BigButton
          bg={t.bgAlt}
          onClick={() => { window.location.href = "/"; }}
          className="w-full"
        >
          go home
        </BigButton>
      </div>
    </div>
  );
}
