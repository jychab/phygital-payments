"use client";

import { Check, Settings2 } from "lucide-react";

import { CopyableAddress } from "@/components/shared/copyable-address";
import { CollectibleOrb } from "@/components/token/collectible-orb";
import { InlineError } from "@/components/shared/inline-error";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/phygital";
import type { PhygitalToken } from "@/lib/phygital/token";
import { cn, shortAddress } from "@/lib/utils";

/** Compact accessory + linked wallet identity — not a hold ceremony. */
export function AccessoryIdentityHeader({
  token,
  owner,
  unclaimed,
  liveConfirmed,
  holdError,
  onVerifyAgain,
  onOpenSettings,
}: {
  token: PhygitalToken;
  owner: string;
  unclaimed: boolean;
  liveConfirmed: boolean;
  holdError?: string | null;
  onVerifyAgain?: () => void;
  onOpenSettings?: () => void;
}) {
  const cardId = shortAddress(token.secp256r1PublicKey, 6);

  return (
    <div className="flex items-center gap-3">
      <CollectibleOrb
        size="md"
        pulsing={false}
        tone={liveConfirmed ? "success" : "default"}
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-eyebrow text-muted-foreground">{copy.pay.accessory}</p>
        <p className="truncate font-(family-name:--font-display) text-base tracking-tight text-foreground">
          {cardId}
        </p>
        {unclaimed ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {copy.token.notLinked}
          </p>
        ) : (
          <p className="mt-0.5 inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <span>{copy.pay.linkedWallet}</span>
            <CopyableAddress
              address={owner}
              length={4}
              label={copy.address.linkedWallet}
              className="text-xs text-muted-foreground"
            />
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {liveConfirmed ? (
          <button
            type="button"
            onClick={onVerifyAgain}
            disabled={!onVerifyAgain}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success",
              onVerifyAgain &&
                "transition-colors hover:bg-success/15 active:scale-[0.98]",
            )}
            aria-label={onVerifyAgain ? copy.verify.verifyAgain : copy.verify.verified}
          >
            <Check className="size-3" aria-hidden />
            {copy.verify.verified}
          </button>
        ) : (
          <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {copy.verify.notVerified}
          </span>
        )}
        {onOpenSettings ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={copy.pay.paySettings}
            onClick={onOpenSettings}
          >
            <Settings2 className="size-4" />
          </Button>
        ) : null}
      </div>
      {holdError ? (
        <div className="absolute left-0 right-0 top-full mt-2">
          <InlineError>{holdError}</InlineError>
        </div>
      ) : null}
    </div>
  );
}
