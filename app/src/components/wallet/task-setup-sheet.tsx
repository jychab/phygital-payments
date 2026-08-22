"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { BackLink } from "@/components/shared/back-link";
import { Button } from "@/components/ui/button";
import { WalletBusyStatus } from "@/components/layout/gate-message";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import { parseSolAmount, formatSol, LAMPORTS_PER_SOL } from "@/lib/wallet/sol";
import { createAgentSessionOnChain } from "@/lib/wallet/agent-client";
import { toUserErrorMessage } from "@/lib/user-errors";
import type { ParsedTask } from "@/lib/wallet/parse-task";

export function TaskSetupSheet({
  draft,
  onBack,
  onDone,
}: {
  draft?: ParsedTask | null;
  onBack: () => void;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const { session } = useSmartWallet();
  const [label, setLabel] = useState(draft?.label ?? "");
  const [limitSol, setLimitSol] = useState(draft?.spendingLimitSol ?? "");
  const [days, setDays] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onConfirm() {
    if (!session || !label.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const lamports = limitSol.trim() ? parseSolAmount(limitSol.trim()) : null;
      await createAgentSessionOnChain({
        session,
        queryClient,
        grantBody: {
          kind: "autonomous",
          task: {
            label: label.trim(),
            spendingLimitLamports:
              lamports != null && lamports > 0n ? lamports.toString() : null,
          },
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
        <h1 className="text-lg font-semibold">Automate a task</h1>
        <p className="text-sm text-muted-foreground">
          Set a spending limit and duration for an autonomous agent.
        </p>
      </div>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">Task label</span>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2"
          placeholder="Weekly DCA"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">
          Spending limit (SOL, optional)
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={limitSol}
          onChange={(e) => setLimitSol(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2"
          placeholder={formatSol(LAMPORTS_PER_SOL)}
        />
      </label>
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
      <Button className="w-full" onClick={onConfirm} disabled={!label.trim()}>
        Confirm with Face ID
      </Button>
    </div>
  );
}
