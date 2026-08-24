"use client";

import { CollectibleHero } from "@/components/card/collectible-hero";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { PhygitalTokenRefreshButton } from "@/components/shared/query-refresh-button";
import { Button } from "@/components/ui/button";
import { useDasCollectible } from "@/hooks/card/use-das-collectible";
import {
  tokenHasLinkedMint,
  isUnclaimedToken,
  type PhygitalToken,
} from "@/lib/phygital/token";
import { shortAddress } from "@/lib/utils";

export function AuthenticCardPanel({
  token,
  liveConfirmed,
  holdError,
  onHoldToCheck,
  onClaim,
  onSignIn,
}: {
  token: PhygitalToken;
  liveConfirmed: boolean;
  holdError?: string | null;
  onHoldToCheck?: () => void;
  onClaim?: () => void;
  onSignIn?: () => void;
}) {
  const linkedMint = tokenHasLinkedMint(token) ? String(token.mint) : null;
  const collectible = useDasCollectible(linkedMint).data;
  const unclaimed = isUnclaimedToken(token);
  const genuine = liveConfirmed
    ? "Confirmed just now."
    : "This accessory is genuine.";
  const ownership = unclaimed
    ? "Genuine. Not in a wallet yet."
    : `Linked to ${shortAddress(String(token.currentOwner))}.`;

  const status = (
    <div className="flex w-full max-w-64 flex-col items-center gap-2">
      <div className="flex items-center gap-0.5">
        <p className="text-xs text-muted-foreground">{ownership}</p>
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

      {onClaim || onSignIn ? (
        <div className="mt-auto flex flex-col gap-2.5 pt-2 motion-safe:animate-[wallet-rise_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
          {onClaim ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={onClaim}
            >
              Add to Wallet
            </Button>
          ) : null}
          {onSignIn ? (
            <Button
              type="button"
              variant={onClaim ? "outline" : "ghost"}
              size="lg"
              className="w-full"
              onClick={onSignIn}
            >
              Sign in
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
