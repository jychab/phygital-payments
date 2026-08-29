"use client";

import { type ReactNode } from "react";
import { Wallet } from "lucide-react";

import { GateMessage } from "@/components/layout/gate-message";
import { Button } from "@/components/ui/button";
import { useExpectedWallet } from "@/hooks/wallet/use-expected-wallet";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";

/** Block UI when a linked wallet and connected wallet are both present but differ. */
export function WalletSyncGate({
  linkedOwner,
  children,
}: {
  linkedOwner: string | null;
  children: ReactNode;
}) {
  const wallet = useExpectedWallet(linkedOwner ?? "");
  const { disconnect } = useSolanaAddress();
  const blocked = Boolean(
    linkedOwner && wallet.isConnected && wallet.wrongWallet,
  );

  if (!blocked) return children;

  return (
    <GateMessage
      icon={<Wallet className="size-5 text-destructive" />}
      title="Wrong wallet"
      body={`This page is for ${wallet.ownerShort}. Disconnect above, then connect that wallet.`}
      destructive
      action={
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="w-full max-w-xs"
          onClick={() => void disconnect()}
        >
          Disconnect
        </Button>
      }
    />
  );
}
