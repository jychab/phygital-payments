"use client";

import { AppShell } from "@/components/layout/app-shell";
import { EmbedBoot, EmbedError } from "@/components/layout/embed-gate";
import { CollectionHome } from "@/components/home/collection-home";
import { ConnectGate } from "@/components/shared/connect-gate";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";

/**
 * Home UI. Collection requires a connected wallet; the chip is always in the
 * shell so connect stays one tap away.
 */
export function HomeWalletShell() {
  const embedded = useIsEmbedded();
  const { address, connect } = useSolanaAddress();

  if (embedded === null) {
    return <EmbedBoot />;
  }

  if (embedded) {
    return (
      <EmbedError
        title="Can’t open here"
        body="Use a payment link instead."
      />
    );
  }

  return (
    <AppShell layout="gallery" wordmark>
      {!address ? (
        <div className="flex flex-1 flex-col items-center justify-center py-14">
          <ConnectGate onConnect={connect} />
        </div>
      ) : (
        <CollectionHome owner={address} />
      )}
    </AppShell>
  );
}
