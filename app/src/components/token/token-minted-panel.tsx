"use client";

import { useMemo } from "react";

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
import { useShortcutOpener } from "@/hooks/token/use-shortcut-opener";
import { copy } from "@/lib/copy/phygital";
import type { CollectibleAttributeWithRarity } from "@/lib/tokens/collectible";
import {
  filterShortcutChips,
  pickPrimaryCtaShortcut,
} from "@/lib/tokens/shortcuts";
import { detailSplitClass } from "@/lib/layout";
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
  const { openCollectibleShortcut, iframeSheet } = useShortcutOpener();

  const primaryShortcut = liveConfirmed
    ? pickPrimaryCtaShortcut(shortcuts)
    : null;
  const chipShortcuts = filterShortcutChips(shortcuts, primaryShortcut);

  const shortcutCtx = useMemo(
    () => ({
      tokenId: mint,
      ownerAddress: String(token.currentOwner),
      collectionId: collectible?.collectionMint ?? null,
    }),
    [mint, token.currentOwner, collectible?.collectionMint],
  );

  const attributesWithRarity: CollectibleAttributeWithRarity[] =
    rarity?.attributes ?? collectible?.attributes ?? [];

  const name = collectible?.name ?? "Card";
  const cardOwner = String(token.currentOwner);
  const hasSticky =
    showVerify || canClaim || Boolean(primaryShortcut);
  let stagger = 0;

  const collectionFootnote =
    fromCollection && liveConfirmed ? copy.token.signedInAsOwner : null;

  return (
    <div className="flex flex-1 flex-col">
      {iframeSheet}
      <div className={detailSplitClass}>
        <CollectibleHero
          src={collectible?.image ?? null}
          alt={name}
          fallbackLabel={name}
          loading={loading}
          reveal={!loading && Boolean(collectible?.image)}
          className="mx-auto w-full max-w-sm sm:max-w-md lg:sticky lg:top-4 lg:mx-0 lg:max-w-none"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-col gap-6 pb-4">
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
                  <p className="text-xs text-muted-foreground">
                    {collectionFootnote}
                  </p>
                ) : null}
                <div className="divide-y divide-border/40">
                  <VerificationMetadataRow
                    liveConfirmed={liveConfirmed}
                    onVerifyAgain={onHoldToCheck}
                  />
                  <CollectibleMetadataRow label={copy.token.linked}>
                    {unclaimed ? (
                      <span className="font-medium text-muted-foreground">
                        {copy.token.notLinked}
                      </span>
                    ) : (
                      <CopyableAddress
                        address={cardOwner}
                        length={4}
                        label={copy.address.linkedWallet}
                      />
                    )}
                  </CollectibleMetadataRow>
                </div>
              </div>
            </MotionSection>

            {chipShortcuts.length > 0 ? (
              <MotionSection staggerIndex={stagger++}>
                <CollectibleShortcuts
                  shortcuts={chipShortcuts}
                  onOpenShortcut={(shortcut) =>
                    openCollectibleShortcut(shortcut, shortcutCtx)
                  }
                />
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
                  variant={
                    canClaim || primaryShortcut ? "outline" : "default"
                  }
                  size="lg"
                  className="w-full"
                  onClick={onHoldToCheck}
                >
                  {copy.verify.holdToCheck}
                </Button>
              ) : null}
              {primaryShortcut ? (
                <Button
                  type="button"
                  variant="default"
                  size="lg"
                  className="w-full"
                  onClick={() =>
                    openCollectibleShortcut(primaryShortcut, shortcutCtx)
                  }
                >
                  {primaryShortcut.label}
                </Button>
              ) : null}
              {canClaim ? (
                <Button
                  type="button"
                  variant={primaryShortcut ? "outline" : "default"}
                  size="lg"
                  className="w-full"
                  onClick={onClaim}
                >
                  {copy.claim.addToWallet}
                </Button>
              ) : null}
            </StickyActions>
          ) : null}
        </div>
      </div>
    </div>
  );
}
