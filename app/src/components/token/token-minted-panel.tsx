"use client";

import { CardMetadata } from "@/components/token/card-metadata";
import { CardSlab } from "@/components/token/card-slab";
import { InlineError } from "@/components/shared/inline-error";
import { PhygitalTokenRefreshButton } from "@/components/shared/query-refresh-button";
import { Button } from "@/components/ui/button";
import { useResolvedDasCollectible } from "@/hooks/token/use-das-collectible";
import { copy } from "@/lib/copy/phygital";
import {
  isUnclaimedToken,
  tokenHasLinkedMint,
  type PhygitalToken,
} from "@/lib/phygital/token";
import { galleryAnimate } from "@/lib/motion";
import { shortAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** Verified card — gallery slab, metadata, authenticity, optional claim. */
export function TokenMintedPanel({
  token,
  liveConfirmed,
  fromCollection = false,
  holdError,
  onHoldToCheck,
  onClaim,
}: {
  token: PhygitalToken;
  liveConfirmed: boolean;
  /** Collection open — verified-owned status copy. */
  fromCollection?: boolean;
  holdError?: string | null;
  onHoldToCheck?: () => void;
  onClaim?: () => void;
}) {
  const unclaimed = isUnclaimedToken(token);
  const canClaim = (unclaimed || !token.isLocked) && Boolean(onClaim);
  const mint = tokenHasLinkedMint(token) ? String(token.mint) : null;
  const { collectible, loading } = useResolvedDasCollectible(mint);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center gap-6 py-4">
        <CardSlab
          src={collectible?.image ?? null}
          alt={collectible?.name ?? "Card"}
          fallbackLabel={collectible?.name ?? "Card"}
          loading={loading}
          reveal={!loading && Boolean(collectible)}
        />

        {collectible ? (
          <CardMetadata
            name={collectible.name}
            collectionName={collectible.collectionName}
            liveConfirmed={liveConfirmed}
          />
        ) : null}

        <TokenMintedActions
          token={token}
          unclaimed={unclaimed}
          owner={String(token.currentOwner)}
          liveConfirmed={liveConfirmed}
          fromCollection={fromCollection}
          holdError={holdError}
          onHoldToCheck={onHoldToCheck}
        />
      </div>

      {canClaim ? (
        <div
          className={cn(
            "mt-auto flex flex-col gap-2.5 pt-2",
            galleryAnimate.rise,
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={onClaim}
          >
            {copy.addToWallet}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function TokenMintedActions({
  token,
  unclaimed,
  owner,
  liveConfirmed,
  fromCollection = false,
  holdError,
  onHoldToCheck,
}: {
  token: PhygitalToken;
  unclaimed: boolean;
  owner: string;
  liveConfirmed: boolean;
  fromCollection?: boolean;
  holdError?: string | null;
  onHoldToCheck?: () => void;
}) {
  return (
    <div className="flex w-full max-w-72 flex-col items-center gap-2 text-center">
      {fromCollection && liveConfirmed ? (
        <p className="text-xs text-muted-foreground">
          {copy.verifiedFromCollection}
        </p>
      ) : null}
      <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
        <span>
          {unclaimed
            ? "Not linked to a wallet."
            : `Linked to ${shortAddress(owner)}.`}
        </span>
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
          {copy.holdToCheck}
        </Button>
      ) : null}
      {holdError ? <InlineError>{holdError}</InlineError> : null}
    </div>
  );
}
