"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { CollectibleAttributes } from "@/components/token/collectible-attributes";
import { CollectibleDescription } from "@/components/token/collectible-description";
import { CollectibleDetails } from "@/components/token/collectible-details";
import { CollectibleHeader } from "@/components/token/collectible-header";
import { CollectibleHero } from "@/components/token/collectible-hero";
import { CollectibleShortcuts } from "@/components/token/collectible-shortcuts";
import { VerificationMetadataRow } from "@/components/token/authenticity-badge";
import { TokenDetails } from "@/components/token/token-details";
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
  tokenHasLinkedMint,
  type PhygitalToken,
} from "@/lib/phygital/token";

/**
 * Minted landing — art first, then verify / primary CTA; details collapsed.
 */
export function TokenMintedPanel({
  token,
  liveConfirmed,
  onHoldToCheck,
  onOpenWallet,
}: {
  token: PhygitalToken;
  liveConfirmed: boolean;
  holdError?: string | null;
  onHoldToCheck?: () => void;
  onOpenWallet?: () => void;
}) {
  const showVerify = !liveConfirmed && Boolean(onHoldToCheck);
  const mint = tokenHasLinkedMint(token) ? String(token.mint) : null;
  const { collectible, rarity, shortcuts, loading, rarityLoading } =
    useMintedCollectibleView(mint);
  const { openCollectibleShortcut, iframeSheet } = useShortcutOpener();
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  const name = collectible?.name ?? copy.token.unnamedCard;
  const hasSticky = showVerify || Boolean(primaryShortcut);
  const hasBelowFold =
    attributesWithRarity.length > 0 ||
    Boolean(collectible?.description) ||
    Boolean(collectible) ||
    Boolean(mint);
  let stagger = 0;

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
          <div className="flex flex-col gap-5 pb-4">
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
              <div className="divide-y divide-border/40">
                <VerificationMetadataRow
                  liveConfirmed={liveConfirmed}
                  onVerifyAgain={onHoldToCheck}
                />
              </div>
            </MotionSection>

            {liveConfirmed && onOpenWallet ? (
              <MotionSection staggerIndex={stagger++}>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={onOpenWallet}
                >
                  {copy.wallet.openWallet}
                </Button>
              </MotionSection>
            ) : null}

            {!liveConfirmed && chipShortcuts.length > 0 ? (
              <MotionSection staggerIndex={stagger++}>
                <p className="px-0.5 text-xs text-muted-foreground">
                  {copy.verify.verifyToUnlockShortcut}
                </p>
              </MotionSection>
            ) : null}

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

            {hasBelowFold ? (
              <MotionSection staggerIndex={stagger++}>
                <button
                  type="button"
                  onClick={() => setDetailsOpen((o) => !o)}
                  className="flex w-full min-h-11 items-center justify-between rounded-2xl bg-grouped px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50"
                >
                  {detailsOpen
                    ? copy.token.hideDetails
                    : copy.token.showDetails}
                  {detailsOpen ? (
                    <ChevronUp className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  )}
                </button>
              </MotionSection>
            ) : null}

            {detailsOpen ? (
              <div className="flex flex-col gap-5">
                {collectible && attributesWithRarity.length > 0 ? (
                  <MotionSection staggerIndex={stagger++}>
                    <CollectibleAttributes attributes={attributesWithRarity} />
                  </MotionSection>
                ) : null}

                {collectible?.description ? (
                  <MotionSection staggerIndex={stagger++}>
                    <CollectibleDescription
                      description={collectible.description}
                    />
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
            ) : null}
          </div>

          {hasSticky ? (
            <StickyActions enterDelayMs={STICKY_ENTER_DELAY_MS}>
              {showVerify ? (
                <Button
                  type="button"
                  variant={primaryShortcut ? "outline" : "default"}
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
              {liveConfirmed && onOpenWallet && primaryShortcut ? (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={onOpenWallet}
                >
                  {copy.wallet.openWallet}
                </Button>
              ) : null}
            </StickyActions>
          ) : null}
        </div>
      </div>
    </div>
  );
}
