"use client";

import { CollectibleHero } from "@/components/accessory/collectible-hero";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { PhygitalTokenRefreshButton } from "@/components/shared/query-refresh-button";
import { Button } from "@/components/ui/button";
import { useDasCollectible } from "@/hooks/accessory/use-das-collectible";
import {
  tokenHasLinkedMint,
  isUnclaimedToken,
  type PhygitalToken,
} from "@/lib/phygital/token";
import { shortAddress } from "@/lib/utils";

/** Verified accessory — collectible art when DAS metadata exists, else NFC ring. */
export function AuthenticAccessoryPanel({
  token,
  liveConfirmed,
  holdError,
  onHoldToCheck,
  onClaim,
}: {
  token: PhygitalToken;
  liveConfirmed: boolean;
  holdError?: string | null;
  onHoldToCheck?: () => void;
  onClaim?: () => void;
}) {
  const unclaimed = isUnclaimedToken(token);
  const canClaim = (unclaimed || !token.isLocked) && Boolean(onClaim);
  const linkedMint = tokenHasLinkedMint(token) ? String(token.mint) : null;
  const collectible = useDasCollectible(linkedMint).data;
  const genuine = liveConfirmed
    ? "Confirmed just now."
    : "This accessory is genuine.";

  const status = (
    <AccessoryStatus
      token={token}
      unclaimed={unclaimed}
      owner={String(token.currentOwner)}
      liveConfirmed={liveConfirmed}
      holdError={holdError}
      onHoldToCheck={onHoldToCheck}
    />
  );

  return (
    <div className="flex flex-1 flex-col">
      {collectible ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 py-6 text-center">
          <CollectibleHero collectible={collectible} />
          <p className="text-sm text-muted-foreground">{genuine}</p>
          {status}
        </div>
      ) : (
        <NfcHoldStatus
          size="lg"
          tone="success"
          pulsing={false}
          title="Verified"
          body={genuine}
          action={status}
        />
      )}

      {canClaim ? (
        <div className="mt-auto flex flex-col gap-2.5 pt-2 motion-safe:animate-[wallet-rise_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={onClaim}
          >
            Add to Wallet
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function AccessoryStatus({
  token,
  unclaimed,
  owner,
  liveConfirmed,
  holdError,
  onHoldToCheck,
}: {
  token: PhygitalToken;
  unclaimed: boolean;
  owner: string;
  liveConfirmed: boolean;
  holdError?: string | null;
  onHoldToCheck?: () => void;
}) {
  return (
    <div className="flex w-full max-w-64 flex-col items-center gap-2">
      <div className="flex items-center gap-0.5">
        <p className="text-xs text-muted-foreground">
          {unclaimed
            ? "Not linked to a wallet."
            : `Linked to ${shortAddress(owner)}.`}
        </p>
        <PhygitalTokenRefreshButton token={token} />
      </div>
      {!liveConfirmed && onHoldToCheck ? (
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="w-full"
          onClick={onHoldToCheck}
        >
          Hold to Check
        </Button>
      ) : null}
      {holdError ? (
        <p className="w-full rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
          {holdError}
        </p>
      ) : null}
    </div>
  );
}
