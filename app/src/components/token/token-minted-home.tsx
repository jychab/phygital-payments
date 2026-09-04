"use client";

import { useCallback, useState } from "react";

import { TokenMintedPanel } from "@/components/token/token-minted-panel";
import { WalletWorkspace } from "@/components/wallet/wallet-workspace";
import { useTokenWalletChip } from "@/hooks/wallet/use-token-wallet-chip";
import {
  TokenVerifySessionGate,
  useTokenVerifySession,
} from "@/hooks/token/use-token-verify-session";
import { useMintedCollectibleView } from "@/hooks/token/use-minted-collectible-view";
import { copy } from "@/lib/copy/phygital";
import {
  tokenHasLinkedMint,
  type PhygitalToken,
} from "@/lib/phygital/token";
import type { WalletRole } from "@/components/token/token-address-route";
import type { LinkStatus } from "@/lib/wallet/device-auth-client";

/** Minted-token home — card gallery; Wallet via identity chip. */
export function TokenMintedHome({
  token: tokenProp,
  liveConfirmed: liveConfirmedProp = false,
  role = "visitor",
  linkStatus,
}: {
  token: PhygitalToken;
  liveConfirmed?: boolean;
  role?: WalletRole;
  linkStatus?: LinkStatus;
}) {
  const session = useTokenVerifySession(tokenProp, liveConfirmedProp);
  const mint = tokenHasLinkedMint(session.token)
    ? String(session.token.mint)
    : null;
  // Shares cache with TokenMintedPanel (same key; seeds dasCollectible).
  const { collectible } = useMintedCollectibleView(mint);
  const [showWallet, setShowWallet] = useState(false);

  const openWallet = useCallback(() => setShowWallet(true), []);

  useTokenWalletChip({
    token: session.token,
    mode: "open-wallet",
    onOpenWallet: openWallet,
    enabled: !showWallet,
  });

  return (
    <TokenVerifySessionGate
      session={session}
      inAppBody={copy.gate.openInBrowserBody}
    >
      {showWallet ? (
        <WalletWorkspace
          token={session.token}
          role={role}
          linkStatus={linkStatus}
          showBackToCard
          onBackToCard={() => setShowWallet(false)}
          cardLabel={collectible?.name ?? copy.wallet.backToCard}
          cardImage={collectible?.image ?? null}
        />
      ) : (
        <div className="flex flex-1 flex-col">
          <TokenMintedPanel
            token={session.token}
            liveConfirmed={session.liveConfirmed}
            holdError={session.holdError}
            onHoldToCheck={() => void session.holdToCheck()}
            onOpenWallet={openWallet}
          />
        </div>
      )}
    </TokenVerifySessionGate>
  );
}
