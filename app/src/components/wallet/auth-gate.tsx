"use client";

import type { ReactNode } from "react";
import { Fingerprint } from "lucide-react";

import { GateMessage, WalletBusyStatus } from "@/components/layout/gate-message";
import { Button } from "@/components/ui/button";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";

export function AuthGate({ children }: { children: ReactNode }) {
  const { isConnected, ready, connecting, connect } = useSmartWallet();

  if (!ready || connecting) {
    return <WalletBusyStatus connecting={connecting} />;
  }

  if (!isConnected) {
    return (
      <GateMessage
        icon={<Fingerprint className="size-5 text-muted-foreground" />}
        title="Sign in"
        body="Use your passkey to continue. A wallet is created if you don’t have one yet — network fees are covered."
        action={
          <Button
            type="button"
            size="lg"
            className="w-full max-w-64"
            onClick={connect}
          >
            Continue with passkey
          </Button>
        }
      />
    );
  }

  return children;
}
