"use client";

import type { ReactNode } from "react";
import { Lock, LockOpen, Nfc } from "lucide-react";

import type { PhygitalToken } from "@/lib/phygital/token";
import { tokenAllowsPay } from "@/lib/phygital/token";
import { cn, shortAddress } from "@/lib/utils";

/** NFC icon + passkey label + lock state — Accessories list and Pay accessory picker. */
export function AccessoryIdentity({
  token,
  className,
  trailing,
}: {
  token: PhygitalToken;
  className?: string;
  trailing?: ReactNode;
}) {
  return (
    <span className={cn("flex min-w-0 items-center gap-3", className)}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card/60">
        <Nfc className="size-4 text-muted-foreground" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {shortAddress(token.secp256r1PublicKey, 6)}
        </span>
        <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
          {token.isLocked ? (
            <>
              <Lock className="size-3" />
              Locked
              {tokenAllowsPay(token) ? (
                <span className="text-muted-foreground/80">· Pay ready</span>
              ) : null}
            </>
          ) : (
            <>
              <LockOpen className="size-3" />
              Unlocked
            </>
          )}
        </span>
      </span>
      {trailing}
    </span>
  );
}
