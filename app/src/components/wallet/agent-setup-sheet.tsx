"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { BackLink } from "@/components/shared/back-link";
import { Button } from "@/components/ui/button";
import { WalletBusyStatus } from "@/components/layout/gate-message";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import { createAgentSessionOnChain } from "@/lib/wallet/agent-client";
import { toUserErrorMessage } from "@/lib/user-errors";

export function AgentSetupSheet({
  phygitalPasskey,
  onBack,
  onDone,
}: {
  phygitalPasskey: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const { session } = useSmartWallet();
  const [days, setDays] = useState(7);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onConfirm() {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      await createAgentSessionOnChain({
        session,
        queryClient,
        grantBody: {
          kind: "nfc",
          phygitalPasskey,
          expiresAtMs: Date.now() + days * 24 * 60 * 60 * 1000,
        },
      });
      onDone();
    } catch (err) {
      setError(toUserErrorMessage(err, "Couldn’t finish. Try again."));
    } finally {
      setBusy(false);
    }
  }

  if (busy) return <WalletBusyStatus connecting />;

  return (
    <div className="flex flex-1 flex-col gap-5">
      <BackLink onClick={onBack} />
      <div className="space-y-1.5 text-center">
        <h1 className="text-lg font-semibold">Allow other apps</h1>
        <p className="text-sm text-muted-foreground">
          Other apps can use this phygital token to sign transactions on your behalf.
        </p>
      </div>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">Duration (days)</span>
        <input
          type="number"
          min={1}
          max={365}
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-lg border bg-background px-3 py-2"
        />
      </label>
      {error ? (
        <p className="text-center text-sm text-destructive">{error}</p>
      ) : null}
      <Button className="w-full" onClick={onConfirm}>
        Confirm with Face ID
      </Button>
    </div>
  );
}
