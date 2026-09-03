"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { IdentityChip } from "@/components/shared/identity-chip";
import { WalletHomePanel } from "@/components/wallet/wallet-home-panel";
import { SendSheet } from "@/components/wallet/send-sheet";
import { ReceiveHub } from "@/components/wallet/receive-hub";
import { ReceiveNearbySheet } from "@/components/wallet/receive-nearby-sheet";
import { SettingsHub, type SettingsTarget } from "@/components/wallet/settings-hub";
import { SpendingLimitsSheet } from "@/components/wallet/spending-limits-sheet";
import { RecipientsSheet } from "@/components/wallet/recipients-sheet";
import { AllowedActionsSheet } from "@/components/wallet/allowed-actions-sheet";
import { SigningSettingsSheet } from "@/components/wallet/signing-settings-sheet";
import { HoldToUnlockGate } from "@/components/wallet/hold-to-unlock-gate";
import { Button } from "@/components/ui/button";
import { useWalletPda } from "@/hooks/wallet/use-wallet-pda";
import { useWalletPortfolio } from "@/hooks/wallet/use-wallet-portfolio";
import { upsertRecent } from "@/lib/wallet/recents";
import { tokenHasLinkedMint, type PhygitalToken } from "@/lib/phygital/token";
import { copy } from "@/lib/copy/phygital";
import { useResolvedDasCollectible } from "@/hooks/token/use-das-collectible";

type Screen =
  | "home"
  | "send"
  | "receive"
  | "nearby"
  | "settings"
  | SettingsTarget;

function settingsFromDenyCode(code?: string): Screen {
  if (code === "recipient_not_allowed") return "recipients";
  if (code === "spend_limit") return "spendingLimits";
  return "settings";
}

/**
 * Shared wallet workspace for accessory landing and card → Wallet mode.
 */
export function WalletWorkspace({
  token,
  showBackToCard,
  onBackToCard,
}: {
  token: PhygitalToken;
  showBackToCard?: boolean;
  onBackToCard?: () => void;
}) {
  return (
    <HoldToUnlockGate>
      <WalletWorkspaceInner
        token={token}
        showBackToCard={showBackToCard}
        onBackToCard={onBackToCard}
      />
    </HoldToUnlockGate>
  );
}

function WalletWorkspaceInner({
  token,
  showBackToCard,
  onBackToCard,
}: {
  token: PhygitalToken;
  showBackToCard?: boolean;
  onBackToCard?: () => void;
}) {
  const tokenAddress = String(token.address);
  const { walletAddress } = useWalletPda(tokenAddress);
  const portfolio = useWalletPortfolio(walletAddress);
  const [screen, setScreen] = useState<Screen>("home");
  const queryClient = useQueryClient();

  const mint = tokenHasLinkedMint(token) ? String(token.mint) : null;
  const { collectible } = useResolvedDasCollectible(mint);

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
      queryKey: ["walletPortfolio", walletAddress],
    });
  }, [queryClient, walletAddress]);

  if (!walletAddress) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {copy.common.loading}
      </p>
    );
  }

  if (screen === "send") {
    return (
      <SendSheet
        phygitalTokenPda={tokenAddress}
        availableUsd={portfolio.data?.totalUsd ?? 0}
        onClose={() => setScreen("home")}
        onSent={refresh}
        onChangeLimits={(code) => setScreen(settingsFromDenyCode(code))}
      />
    );
  }

  if (screen === "receive") {
    return (
      <ReceiveHub
        walletAddress={walletAddress}
        onClose={() => setScreen("home")}
        onReceiveNearby={() => setScreen("nearby")}
      />
    );
  }

  if (screen === "nearby") {
    return (
      <ReceiveNearbySheet
        recipientWallet={walletAddress}
        onClose={() => setScreen("receive")}
        onReceived={refresh}
      />
    );
  }

  if (screen === "settings") {
    return (
      <SettingsHub
        onBack={() => setScreen("home")}
        onOpen={(target) => setScreen(target)}
      />
    );
  }

  if (screen === "spendingLimits") {
    return (
      <SpendingLimitsSheet
        phygitalTokenPda={tokenAddress}
        onBack={() => setScreen("settings")}
      />
    );
  }

  if (screen === "recipients") {
    return (
      <RecipientsSheet
        phygitalTokenPda={tokenAddress}
        onBack={() => setScreen("settings")}
      />
    );
  }

  if (screen === "allowedActions") {
    return (
      <AllowedActionsSheet
        phygitalTokenPda={tokenAddress}
        onBack={() => setScreen("settings")}
      />
    );
  }

  if (screen === "signing") {
    return (
      <SigningSettingsSheet
        phygitalTokenPda={tokenAddress}
        onClose={() => setScreen("settings")}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between gap-2">
        {showBackToCard ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1 px-2"
            onClick={onBackToCard}
          >
            <ArrowLeft className="size-4" />
            {copy.wallet.backToCard}
          </Button>
        ) : (
          <span />
        )}
        <IdentityChip walletAddress={walletAddress} mode="copy" />
      </div>
      <WalletHomePanel
        portfolio={portfolio.data}
        loading={portfolio.isLoading}
        onSend={() => setScreen("send")}
        onReceive={() => setScreen("receive")}
        onSettings={() => setScreen("settings")}
      />
    </div>
  );
}
