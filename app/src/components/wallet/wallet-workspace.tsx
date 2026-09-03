"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { NavBar } from "@/components/shared/nav-bar";
import { StageTransition } from "@/components/shared/stage-transition";
import { WalletHomePanel } from "@/components/wallet/wallet-home-panel";
import { SendSheet } from "@/components/wallet/send-sheet";
import { CollectibleDetailSheet } from "@/components/wallet/collectible-detail-sheet";
import { ReceiveHub } from "@/components/wallet/receive-hub";
import { ReceiveNearbySheet } from "@/components/wallet/receive-nearby-sheet";
import { SettingsHub, type SettingsTarget } from "@/components/wallet/settings-hub";
import { SpendingLimitsSheet } from "@/components/wallet/spending-limits-sheet";
import { RecipientsSheet } from "@/components/wallet/recipients-sheet";
import { AllowedActionsSheet } from "@/components/wallet/allowed-actions-sheet";
import { SigningSettingsSheet } from "@/components/wallet/signing-settings-sheet";
import { FeeBalanceSheet } from "@/components/wallet/fee-balance-sheet";
import { TokensAllSheet } from "@/components/wallet/tokens-all-sheet";
import { CollectiblesAllSheet } from "@/components/wallet/collectibles-all-sheet";
import { HoldToUnlockGate } from "@/components/wallet/hold-to-unlock-gate";
import { Button } from "@/components/ui/button";
import { useTokenWalletChip } from "@/hooks/wallet/use-token-wallet-chip";
import { useWalletPortfolio } from "@/hooks/wallet/use-wallet-portfolio";
import { useFeeBalance } from "@/hooks/wallet/use-fee-balance";
import { upsertRecent } from "@/lib/wallet/recents";
import { tokenHasLinkedMint, type PhygitalToken } from "@/lib/phygital/token";
import { copy } from "@/lib/copy/phygital";
import { useResolvedDasCollectible } from "@/hooks/token/use-das-collectible";
import { shellLayoutClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/lib/queries";
import type { WalletCollectible } from "@/lib/wallet/portfolio-types";
import {
  collectibleToSendAsset,
  type SendAssetRef,
} from "@/lib/wallet/send-asset-ref";

type Screen =
  | "home"
  | "send"
  | "receive"
  | "nearby"
  | "tokensAll"
  | "collectiblesAll"
  | "settings"
  | SettingsTarget;

function settingsFromDenyCode(code?: string): Screen {
  if (code === "recipient_not_allowed") return "recipients";
  if (code === "spend_limit") return "spendingLimits";
  if (code === "insufficient_fee_balance") return "feeBalance";
  return "settings";
}

/**
 * Shared wallet workspace for accessory landing and card → Wallet mode.
 * Always renders in a compact (phone-width) column, even inside gallery shell.
 */
export function WalletWorkspace({
  token,
  showBackToCard,
  onBackToCard,
  cardLabel,
  cardImage,
}: {
  token: PhygitalToken;
  showBackToCard?: boolean;
  onBackToCard?: () => void;
  cardLabel?: string;
  cardImage?: string | null;
}) {
  return (
    <div className={cn("mx-auto flex w-full flex-1 flex-col", shellLayoutClass.compact)}>
      <HoldToUnlockGate>
        <WalletWorkspaceInner
          token={token}
          showBackToCard={showBackToCard}
          onBackToCard={onBackToCard}
          cardLabel={cardLabel}
          cardImage={cardImage}
        />
      </HoldToUnlockGate>
    </div>
  );
}

function WalletWorkspaceInner({
  token,
  showBackToCard,
  onBackToCard,
  cardLabel,
  cardImage,
}: {
  token: PhygitalToken;
  showBackToCard?: boolean;
  onBackToCard?: () => void;
  cardLabel?: string;
  cardImage?: string | null;
}) {
  const tokenAddress = String(token.address);
  const mint = tokenHasLinkedMint(token) ? String(token.mint) : null;
  const { collectible } = useResolvedDasCollectible(mint);
  const [screen, setScreen] = useState<Screen>("home");
  const [sendAsset, setSendAsset] = useState<SendAssetRef | null>(null);
  const [sendTokensOnly, setSendTokensOnly] = useState(true);
  const [detail, setDetail] = useState<WalletCollectible | null>(null);
  const queryClient = useQueryClient();

  const onSettings = useCallback(() => setScreen("settings"), []);

  const { walletAddress } = useTokenWalletChip({
    token,
    mode: "copy",
    onSettings,
  });

  const portfolio = useWalletPortfolio(walletAddress);
  const feeBalance = useFeeBalance(tokenAddress);

  useEffect(() => {
    if (!walletAddress) return;
    upsertRecent({
      tokenAddress,
      walletAddress,
      kind: mint ? "card" : "accessory",
      label: collectible?.name ?? (mint ? copy.recents.card : copy.recents.accessory),
      imageUrl: collectible?.image ?? null,
    });
  }, [walletAddress, tokenAddress, mint, collectible?.name, collectible?.image]);

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.walletPortfolio.byOwner(walletAddress),
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.feeBalance.byToken(tokenAddress),
    });
  }, [queryClient, walletAddress, tokenAddress]);

  const openSend = useCallback(
    (asset: SendAssetRef | null, tokensOnly: boolean) => {
      setSendAsset(asset);
      setSendTokensOnly(tokensOnly);
      setScreen("send");
    },
    [],
  );

  if (!walletAddress) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {copy.common.loading}
      </p>
    );
  }

  const backLabel = cardLabel ?? copy.wallet.backToCard;

  let body: ReactNode;

  if (screen === "send") {
    body = (
      <SendSheet
        phygitalTokenPda={tokenAddress}
        portfolio={portfolio.data}
        initialAsset={sendAsset}
        tokensOnly={sendTokensOnly}
        onClose={() => {
          setScreen("home");
          setSendAsset(null);
        }}
        onSent={refresh}
        onChangeLimits={(code) => setScreen(settingsFromDenyCode(code))}
      />
    );
  } else if (screen === "receive") {
    body = (
      <ReceiveHub
        walletAddress={walletAddress}
        onClose={() => setScreen("home")}
        onReceiveNearby={() => setScreen("nearby")}
      />
    );
  } else if (screen === "nearby") {
    body = (
      <ReceiveNearbySheet
        recipientWallet={walletAddress}
        onClose={() => setScreen("receive")}
        onReceived={refresh}
      />
    );
  } else if (screen === "tokensAll") {
    body = (
      <TokensAllSheet
        holdings={portfolio.data?.holdings ?? []}
        onBack={() => setScreen("home")}
        onSelect={(asset) => openSend(asset, true)}
      />
    );
  } else if (screen === "collectiblesAll") {
    body = (
      <CollectiblesAllSheet
        collectibles={portfolio.data?.collectibles ?? []}
        linkedMint={mint}
        onBack={() => setScreen("home")}
        onSelect={setDetail}
      />
    );
  } else if (screen === "settings") {
    body = (
      <SettingsHub
        phygitalTokenPda={tokenAddress}
        onBack={() => setScreen("home")}
        onOpen={(target) => setScreen(target)}
      />
    );
  } else if (screen === "feeBalance") {
    body = (
      <FeeBalanceSheet
        phygitalTokenPda={tokenAddress}
        onBack={() => setScreen("settings")}
      />
    );
  } else if (screen === "spendingLimits") {
    body = (
      <SpendingLimitsSheet
        phygitalTokenPda={tokenAddress}
        onBack={() => setScreen("settings")}
      />
    );
  } else if (screen === "recipients") {
    body = (
      <RecipientsSheet
        phygitalTokenPda={tokenAddress}
        onBack={() => setScreen("settings")}
      />
    );
  } else if (screen === "allowedActions") {
    body = (
      <AllowedActionsSheet
        phygitalTokenPda={tokenAddress}
        onBack={() => setScreen("settings")}
      />
    );
  } else if (screen === "signing") {
    body = (
      <SigningSettingsSheet
        phygitalTokenPda={tokenAddress}
        onClose={() => setScreen("settings")}
      />
    );
  } else {
    body = (
      <div className="flex flex-1 flex-col">
        {showBackToCard ? (
          <NavBar
            leading={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 px-2"
                onClick={onBackToCard}
              >
                {cardImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cardImage}
                    alt=""
                    className="size-5 rounded object-cover"
                  />
                ) : (
                  <ArrowLeft className="size-4" />
                )}
                <span className="max-w-32 truncate">{backLabel}</span>
              </Button>
            }
          />
        ) : null}
        <WalletHomePanel
          portfolio={portfolio.data}
          loading={portfolio.isLoading}
          linkedMint={mint}
          onSend={() => openSend(null, true)}
          onSendAsset={(asset) => openSend(asset, true)}
          onReceive={() => setScreen("receive")}
          onSelectCollectible={setDetail}
          onSeeAllTokens={() => setScreen("tokensAll")}
          onSeeAllCollectibles={() => setScreen("collectiblesAll")}
          feeBalanceLow={feeBalance.data?.low}
          onTopUpFees={() => setScreen("feeBalance")}
        />
      </div>
    );
  }

  return (
    <>
      <StageTransition stageKey={screen} variant="fade">
        {body}
      </StageTransition>
      <CollectibleDetailSheet
        collectible={detail}
        open={detail != null}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
        onSend={(c) => openSend(collectibleToSendAsset(c), false)}
        onOpenCard={
          showBackToCard &&
          onBackToCard &&
          mint &&
          detail?.mint === mint
            ? onBackToCard
            : undefined
        }
      />
    </>
  );
}
