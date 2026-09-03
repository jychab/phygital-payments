"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { NavBar } from "@/components/shared/nav-bar";
import { StageTransition } from "@/components/shared/stage-transition";
import { WalletHomePanel } from "@/components/wallet/wallet-home-panel";
import { SendDialog } from "@/components/wallet/send-dialog";
import { SendHoldStage } from "@/components/wallet/send-hold-stage";
import { ActivityAllSheet } from "@/components/wallet/activity-all-sheet";
import { CollectibleDetailSheet } from "@/components/wallet/collectible-detail-sheet";
import { ReceiveHub } from "@/components/wallet/receive-hub";
import { ReceiveNearbySheet } from "@/components/wallet/receive-nearby-sheet";
import { SettingsHub, type SettingsTarget } from "@/components/wallet/settings-hub";
import { SpendingLimitsSheet } from "@/components/wallet/spending-limits-sheet";
import { RecipientsSheet } from "@/components/wallet/recipients-sheet";
import { AllowedActionsSheet } from "@/components/wallet/allowed-actions-sheet";
import { SigningSettingsSheet } from "@/components/wallet/signing-settings-sheet";
import { FeeBalanceSheet } from "@/components/wallet/fee-balance-sheet";
import { RpcConnectionSheet } from "@/components/wallet/rpc-connection-sheet";
import { TokensAllSheet } from "@/components/wallet/tokens-all-sheet";
import { CollectiblesAllSheet } from "@/components/wallet/collectibles-all-sheet";
import { HoldToUnlockGate } from "@/components/wallet/hold-to-unlock-gate";
import { useRpcPreference } from "@/hooks/wallet/use-rpc-preference";
import { Button } from "@/components/ui/button";
import { useTokenWalletChip } from "@/hooks/wallet/use-token-wallet-chip";
import { useWalletPortfolio } from "@/hooks/wallet/use-wallet-portfolio";
import { useWalletActivity } from "@/hooks/wallet/use-wallet-activity";
import { useFeeBalance } from "@/hooks/wallet/use-fee-balance";
import { upsertRecent } from "@/lib/wallet/recents";
import { tokenHasLinkedMint, type PhygitalToken } from "@/lib/phygital/token";
import { copy } from "@/lib/copy/phygital";
import { useResolvedDasCollectible } from "@/hooks/token/use-das-collectible";
import { shellLayoutClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { invalidateWalletBalances } from "@/lib/queries";
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
  | "activity"
  | "settings"
  | SettingsTarget;

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

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
  // Parent (minted home) already resolved collectible via minted-view cache.
  const { collectible } = useResolvedDasCollectible(mint, {
    enabled: cardLabel == null,
  });
  const resolvedLabel =
    collectible?.name ?? cardLabel ?? (mint ? copy.recents.card : copy.recents.accessory);
  const resolvedImage = collectible?.image ?? cardImage ?? null;
  const [screen, setScreen] = useState<Screen>("home");
  const [sendAsset, setSendAsset] = useState<SendAssetRef | null>(null);
  const [sendTokensOnly, setSendTokensOnly] = useState(true);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendHoldPhase, setSendHoldPhase] = useState<"holding" | "success" | null>(
    null,
  );
  const [detail, setDetail] = useState<WalletCollectible | null>(null);
  const queryClient = useQueryClient();

  const onSettings = useCallback(() => setScreen("settings"), []);

  const { walletAddress } = useTokenWalletChip({
    token,
    mode: "copy",
  });

  const portfolio = useWalletPortfolio(walletAddress);
  const activity = useWalletActivity(walletAddress, 20);
  const feeBalance = useFeeBalance(tokenAddress);
  const rpc = useRpcPreference();
  useEffect(() => {
    if (!walletAddress) return;
    upsertRecent({
      tokenAddress,
      walletAddress,
      kind: mint ? "card" : "accessory",
      label: resolvedLabel,
      mint: mint ?? null,
      imageUrl: resolvedImage,
      secp256r1PublicKey: token.secp256r1PublicKey,
    });
  }, [
    walletAddress,
    tokenAddress,
    mint,
    resolvedLabel,
    resolvedImage,
    token.secp256r1PublicKey,
  ]);

  const refresh = useCallback(() => {
    invalidateWalletBalances(queryClient, {
      wallets: [walletAddress],
      tokens: [tokenAddress],
    });
  }, [queryClient, walletAddress, tokenAddress]);

  const activityRefetch = activity.refetch;
  const portfolioRefetch = portfolio.refetch;
  const refreshWallet = useCallback(() => {
    refresh();
    void activityRefetch();
    void portfolioRefetch();
  }, [activityRefetch, portfolioRefetch, refresh]);

  const openSend = useCallback(
    (asset: SendAssetRef | null, tokensOnly: boolean) => {
      setSendAsset(asset);
      setSendTokensOnly(tokensOnly);
      setSendHoldPhase(null);
      setDetail(null);
      setScreen("home");
      setSendDialogOpen(true);
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

  const backLabel = cardLabel ?? collectible?.name ?? copy.wallet.backToCard;

  let body: ReactNode;

  if (screen === "send") {
    body = (
      <SendHoldStage
        phase={sendHoldPhase ?? "holding"}
        imageSrc={sendAsset?.icon}
        onClose={() => {
          setSendHoldPhase(null);
          setSendAsset(null);
          setScreen("home");
        }}
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
  } else if (screen === "activity") {
    body = (
      <ActivityAllSheet
        walletAddress={walletAddress}
        onBack={() => setScreen("home")}
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
  } else if (screen === "rpcConnection") {
    body = (
      <RpcConnectionSheet onBack={() => setScreen("settings")} />
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
          tokenAddress={tokenAddress}
          linkedMint={mint}
          onSend={() => openSend(null, true)}
          onSendAsset={(asset) => openSend(asset, true)}
          onReceive={() => setScreen("receive")}
          onSelectCollectible={setDetail}
          onSeeAllTokens={() => setScreen("tokensAll")}
          onSeeAllCollectibles={() => setScreen("collectiblesAll")}
          onSeeAllActivity={() => setScreen("activity")}
          onManageDevice={onSettings}
          feeBalanceLow={feeBalance.data?.low}
          onTopUpFees={() => setScreen("feeBalance")}
          customRpcEndpoint={rpc.isCustom ? rpc.displayEndpoint : null}
          onChangeRpc={() => setScreen("rpcConnection")}
          onRefresh={refreshWallet}
          refreshing={portfolio.isFetching || activity.isFetching}
          lastUpdatedLabel={
            portfolio.dataUpdatedAt
              ? copy.wallet.lastUpdated(
                  timeFormatter.format(portfolio.dataUpdatedAt),
                )
              : null
          }
          activityItems={activity.items}
          activityAssetMetaByMint={activity.mintMeta}
        />
      </div>
    );
  }

  return (
    <>
      <SendDialog
        phygitalTokenPda={tokenAddress}
        walletAddress={walletAddress}
        portfolio={portfolio.data}
        initialAsset={sendAsset}
        tokensOnly={sendTokensOnly}
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        onHoldPhaseChange={(phase) => {
          setSendHoldPhase(phase);
          setScreen("send");
        }}
        onSent={refresh}
        onChangeLimits={(code) => setScreen(settingsFromDenyCode(code))}
      />
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
