"use client";

import { CollectibleAttributes } from "@/components/token/collectible-attributes";
import { CollectibleDescription } from "@/components/token/collectible-description";
import { CollectibleDetails } from "@/components/token/collectible-details";
import { CollectibleHeader } from "@/components/token/collectible-header";
import { CollectibleHero } from "@/components/token/collectible-hero";
import { CollectibleShortcuts } from "@/components/token/collectible-shortcuts";
import { VerificationMetadataRow } from "@/components/token/authenticity-badge";
import { CollectibleMetadataRow } from "@/components/token/collectible-metadata-group";
import { TokenDetails } from "@/components/token/token-details";
import { CopyableAddress } from "@/components/shared/copyable-address";
import { StickyActions } from "@/components/shared/sticky-actions";
import { MotionSection } from "@/components/shared/motion-section";
import { Button } from "@/components/ui/button";
import { useMintedCollectibleView } from "@/hooks/token/use-minted-collectible-view";
import { copy } from "@/lib/copy/phygital";
import type { CollectibleAttributeWithRarity } from "@/lib/tokens/collectible";
import { STICKY_ENTER_DELAY_MS } from "@/lib/motion";
import {
  isUnclaimedToken,
  tokenHasLinkedMint,
  type PhygitalToken,
} from "@/lib/phygital/token";

/**
 * Minted landing — Tensor/ME-inspired priority:
 * identity → actions → traits → story → reference details.
 */
export function TokenMintedPanel({
  token,
  liveConfirmed,
  fromCollection = false,
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
  const { collectible, rarity, shortcuts, loading, rarityLoading } =
    useMintedCollectibleView(mint);

  const attributesWithRarity: CollectibleAttributeWithRarity[] =
    rarity?.attributes ?? collectible?.attributes ?? [];

  const name = collectible?.name ?? "Card";
  const cardOwner = String(token.currentOwner);
  const hasSticky = showVerify || canClaim;
  let stagger = 0;

  const collectionFootnote =
    fromCollection && liveConfirmed ? copy.signedInAsOwner : null;

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
              rarity={rarity}
              rarityLoading={rarityLoading}
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
            {collectionFootnote ? (
              <p className="text-xs text-muted-foreground">{collectionFootnote}</p>
            ) : null}
            <div className="divide-y divide-border/40">
              <VerificationMetadataRow
                liveConfirmed={liveConfirmed}
                onVerifyAgain={onHoldToCheck}
              />
              <CollectibleMetadataRow label={copy.linked}>
                {unclaimed ? (
                  <span className="font-medium text-muted-foreground">
                    {copy.notLinked}
                  </span>
                ) : (
                  <CopyableAddress
                    address={cardOwner}
                    length={4}
                    label="linked wallet"
                  />
                )}
              </CollectibleMetadataRow>
            </div>
          </div>
        </MotionSection>

        {shortcuts.length > 0 ? (
          <MotionSection staggerIndex={stagger++}>
            <CollectibleShortcuts shortcuts={shortcuts} />
          </MotionSection>
        ) : null}

        {collectible && attributesWithRarity.length > 0 ? (
          <MotionSection staggerIndex={stagger++}>
            <CollectibleAttributes attributes={attributesWithRarity} />
          </MotionSection>
        ) : null}

        {collectible?.description ? (
          <MotionSection staggerIndex={stagger++}>
            <CollectibleDescription description={collectible.description} />
          </MotionSection>
        ) : null}

        {collectible ? (
          <MotionSection staggerIndex={stagger++}>
            <CollectibleDetails
              collectionName={collectible.collectionName}
              collectionImage={collectible.collectionImage}
              collectionDescription={collectible.collectionDescription}
            />
          </MotionSection>
        ) : null}

        <MotionSection staggerIndex={stagger++}>
          <TokenDetails
            cardId={token.secp256r1PublicKey}
            mint={mint}
            mintOwner={collectible?.mintOwner}
          />
        </MotionSection>
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
