"use client";

import { CollectibleAttributes } from "@/components/token/collectible-attributes";
import { CollectibleDescription } from "@/components/token/collectible-description";
import { CollectibleDetails } from "@/components/token/collectible-details";
import { CollectibleHeader } from "@/components/token/collectible-header";
import { CollectibleHero } from "@/components/token/collectible-hero";
import { CollectibleShortcuts } from "@/components/token/collectible-shortcuts";
import { StickyActions } from "@/components/shared/sticky-actions";
import { InlineError } from "@/components/shared/inline-error";
import { MotionSection } from "@/components/shared/motion-section";
import { PhygitalTokenRefreshButton } from "@/components/shared/query-refresh-button";
import { Button } from "@/components/ui/button";
import { useCollectibleShortcuts } from "@/hooks/token/use-collectible-shortcuts";
import { useResolvedDasCollectible } from "@/hooks/token/use-das-collectible";
import { copy } from "@/lib/copy/phygital";
import { STICKY_ENTER_DELAY_MS } from "@/lib/motion";
import {
  isUnclaimedToken,
  tokenHasLinkedMint,
  type PhygitalToken,
} from "@/lib/phygital/token";
import { shortAddress } from "@/lib/utils";

/** Verified card — collector detail: DAS art, authenticity, claim, dossier. */
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
  const showVerify = !liveConfirmed && Boolean(onHoldToCheck);
  const mint = tokenHasLinkedMint(token) ? String(token.mint) : null;
  const { collectible, loading } = useResolvedDasCollectible(mint);
  const shortcutsQuery = useCollectibleShortcuts(
    collectible?.externalUrl,
    collectible?.collectionMint,
  );
  const shortcuts = shortcutsQuery.data ?? [];

  const name = collectible?.name ?? "Card";
  const owner = String(token.currentOwner);
  const hasSticky = showVerify || canClaim;
  let stagger = 0;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 pb-4">
        <CollectibleHero
          src={collectible?.image ?? null}
          alt={name}
          fallbackLabel={name}
          loading={loading}
          reveal={!loading && Boolean(collectible?.image)}
        />

        <MotionSection staggerIndex={stagger++}>
          {collectible ? (
            <CollectibleHeader
              name={collectible.name}
              collectionName={collectible.collectionName}
              collectionImage={collectible.collectionImage}
              liveConfirmed={liveConfirmed}
            />
          ) : loading ? (
            <div
              className="h-14 animate-pulse rounded-xl bg-muted/40"
              aria-hidden
            />
          ) : null}
        </MotionSection>

        <MotionSection staggerIndex={stagger++}>
          <div className="flex w-full flex-col gap-1.5 text-left">
            {fromCollection && liveConfirmed ? (
              <p className="text-xs text-muted-foreground">
                {copy.verifiedFromCollection}
              </p>
            ) : null}
            <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <span>
                {unclaimed
                  ? copy.notLinked
                  : copy.linkedTo(shortAddress(owner))}
              </span>
              <PhygitalTokenRefreshButton token={token} />
            </div>
            {holdError ? <InlineError>{holdError}</InlineError> : null}
          </div>
        </MotionSection>

        {shortcuts.length > 0 ? (
          <MotionSection staggerIndex={stagger++}>
            <CollectibleShortcuts shortcuts={shortcuts} />
          </MotionSection>
        ) : null}

        {collectible?.description ? (
          <MotionSection staggerIndex={stagger++}>
            <CollectibleDescription description={collectible.description} />
          </MotionSection>
        ) : null}

        {collectible && collectible.attributes.length > 0 ? (
          <MotionSection staggerIndex={stagger++}>
            <CollectibleAttributes attributes={collectible.attributes} />
          </MotionSection>
        ) : null}

        {mint ? (
          <MotionSection staggerIndex={stagger++}>
            <CollectibleDetails
              mint={mint}
              collectionName={collectible?.collectionName}
              collectionImage={collectible?.collectionImage}
              collectionDescription={collectible?.collectionDescription}
            />
          </MotionSection>
        ) : null}
      </div>

      {hasSticky ? (
        <StickyActions enterDelayMs={STICKY_ENTER_DELAY_MS}>
          {showVerify ? (
            <Button
              type="button"
              variant={canClaim ? "outline" : "default"}
              size="lg"
              className="w-full"
              onClick={onHoldToCheck}
            >
              {copy.holdToCheck}
            </Button>
          ) : null}
          {canClaim ? (
            <Button
              type="button"
              variant="default"
              size="lg"
              className="w-full"
              onClick={onClaim}
            >
              {copy.addToWallet}
            </Button>
          ) : null}
        </StickyActions>
      ) : null}
    </div>
  );
}
