"use client";

import type { ReactNode } from "react";
import { Fingerprint } from "lucide-react";

import { GateMessage, WalletBusyStatus } from "@/components/layout/gate-message";
import { Button } from "@/components/ui/button";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";

export function AuthGate({ children }: { children: ReactNode }) {
  const { isConnected, ready, connecting, signIn, signUp } = useSmartWallet();

  if (!ready || connecting) {
    return <WalletBusyStatus connecting={connecting} />;
  }

  if (!isConnected) {
    return (
      <GateMessage
        icon={<Fingerprint className="size-5 text-muted-foreground" />}
        title="Your passkey is this wallet"
        body="There is no recovery phrase. Network fees are covered."
        action={
          <div className="flex w-full max-w-64 flex-col gap-4">
            <Button type="button" size="lg" className="w-full" onClick={signIn}>
              Sign in with passkey
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="w-full"
              onClick={signUp}
            >
              Create a new wallet
            </Button>
          </div>
        }
      />
    );
  }

  return children;
}
