"use client";

import { PrivyGate } from "@/app/privy-wallet-root";
import { AppShell } from "@/components/layout/app-shell";
import { EmbedBoot, EmbedError } from "@/components/layout/embed-gate";
import { CollectionHome } from "@/components/home/collection-home";
import { ConnectGate } from "@/components/shared/connect-gate";
import { LoadingStatus } from "@/components/shared/loading-status";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";

/**
 * Home UI. Loaded from `HomeApp` with `ssr: false` so Privy hooks never run
 * on the server. Uses the root `PrivyProvider` via `PrivyGate`.
 */
export function HomeWalletShell() {
  return (
    <PrivyGate>
      <HomeScreen />
    </PrivyGate>
  );
}

function HomeScreen() {
  const embedded = useIsEmbedded();
  const { address, isConnected, ready, connect } = useSolanaAddress();

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
      {!ready ? (
        <LoadingStatus label="Loading…" />
      ) : !isConnected || !address ? (
        <div className="flex flex-1 flex-col items-center justify-center py-14">
          <ConnectGate onConnect={connect} />
        </div>
      ) : (
        <CollectionHome owner={address} />
      )}
    </AppShell>
  );
}
