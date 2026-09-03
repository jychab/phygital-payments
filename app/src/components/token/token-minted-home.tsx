"use client";

import { useState } from "react";

import { TokenMintedPanel } from "@/components/token/token-minted-panel";
import { WalletWorkspace } from "@/components/wallet/wallet-workspace";
import { IdentityChip } from "@/components/shared/identity-chip";
import {
  TokenVerifySessionGate,
  useTokenVerifySession,
} from "@/hooks/token/use-token-verify-session";
import { useWalletPda } from "@/hooks/wallet/use-wallet-pda";
import { copy } from "@/lib/copy/phygital";
import type { PhygitalToken } from "@/lib/phygital/token";

/** Minted-token home — card gallery; Wallet via identity chip. */
export function TokenMintedHome({
  token: tokenProp,
  liveConfirmed: liveConfirmedProp = false,
}: {
  token: PhygitalToken;
  liveConfirmed?: boolean;
}) {
  const session = useTokenVerifySession(tokenProp, liveConfirmedProp);
  const { walletAddress } = useWalletPda(String(session.token.address));
  const [showWallet, setShowWallet] = useState(false);

  return (
    <TokenVerifySessionGate
      session={session}
      inAppBody={copy.gate.openInBrowserBody}
    >
      {showWallet ? (
        <WalletWorkspace
          token={session.token}
          showBackToCard
          onBackToCard={() => setShowWallet(false)}
        />
      ) : (
        <div className="flex flex-1 flex-col">
          <div className="mb-2 flex justify-end">
            <IdentityChip
              walletAddress={walletAddress}
              mode="open-wallet"
              onOpenWallet={() => setShowWallet(true)}
            />
          </div>
          <TokenMintedPanel
            token={session.token}
            liveConfirmed={session.liveConfirmed}
            holdError={session.holdError}
            onHoldToCheck={() => void session.holdToCheck()}
          />
        </div>
      )}
    </TokenVerifySessionGate>
  );
}
