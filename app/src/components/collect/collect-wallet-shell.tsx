"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Wallet } from "lucide-react";
import type { Address } from "@solana/kit";

import { PrivyGate } from "@/app/privy-wallet-root";
import { CollectPanel } from "@/components/collect/collect-panel";
import {
  AppCard,
  AppShell,
  homeCollectModeNav,
} from "@/components/layout/app-shell";
import { CenteredStatus, GateMessage } from "@/components/layout/gate-message";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import {
  resolveCollectRecipient,
  type PaymentRequest,
} from "@/lib/collect/payment-request";

/**
 * Non-embed `/collect`. Loaded from `CollectApp` with `ssr: false` so Privy
 * hooks never run on the server. Recipient is the connected wallet, or
 * `?recipient=` when no session exists. Connecting writes the wallet into
 * the URL so the two stay in sync.
 */
export function CollectWalletShell({
  paymentRequest,
}: {
  paymentRequest: PaymentRequest;
}) {
  return (
    <PrivyGate>
      <CollectScreen paymentRequest={paymentRequest} />
    </PrivyGate>
  );
}

function CollectScreen({ paymentRequest }: { paymentRequest: PaymentRequest }) {
  const { address, isConnected, ready } = useSolanaAddress();
  const [linkRecipient, setLinkRecipient] = useState<Address | null>(
    paymentRequest.recipient,
  );

  useEffect(() => {
    if (!address) return;
    setLinkRecipient((prev) => resolveCollectRecipient(address, prev));
  }, [address]);

  const recipient = resolveCollectRecipient(address, linkRecipient);
  const modeNav =
    isConnected && address ? homeCollectModeNav(address) : null;

  return (
    <AppShell modeLabel="Collect" modeNav={modeNav}>
      {!recipient ? (
        <AppCard>
          {!ready ? (
            <CenteredStatus>
              <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading…</p>
            </CenteredStatus>
          ) : paymentRequest.hasRecipientParam ? (
            <GateMessage
              icon={<Wallet className="size-5 text-muted-foreground" />}
              title="This payment link isn’t set up"
              body="The link looks incomplete. Connect a wallet to collect, or ask for a new one."
            />
          ) : (
            <GateMessage
              icon={<Wallet className="size-5 text-muted-foreground" />}
              title="Connect your wallet"
              body="Connect to collect payments to this wallet."
            />
          )}
        </AppCard>
      ) : (
        <AppCard>
          <CollectPanel
            paymentRequest={{ ...paymentRequest, recipient }}
            allowWalletSetup
          />
        </AppCard>
      )}
    </AppShell>
  );
}
