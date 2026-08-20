"use client";

import { type ReactNode } from "react";
import { Wallet } from "lucide-react";

import { GateMessage } from "@/components/layout/gate-message";
import { Button } from "@/components/ui/button";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import { useWalletSync } from "@/hooks/wallet/use-wallet-sync";

/** Block UI when a linked wallet and connected wallet are both present but differ. */
export function WalletSyncGate({
  linkedOwner,
  children,
}: {
  linkedOwner: string | null;
  children: ReactNode;
}) {
  const { blocked, ownerShort } = useWalletSync(linkedOwner);
  const { disconnect } = useSolanaAddress();

  if (!blocked) return children;

  return (
    <GateMessage
      icon={<Wallet className="size-5 text-destructive" />}
      title="Wallet mismatch"
      body={`This page is linked to ${ownerShort}. Disconnect above, then connect that wallet.`}
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
