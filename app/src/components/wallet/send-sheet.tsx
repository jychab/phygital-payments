"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";

import { BackLink } from "@/components/shared/back-link";
import { Button } from "@/components/ui/button";
import { SuccessStatus, WalletBusyStatus } from "@/components/layout/gate-message";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import { useWalletPortfolio } from "@/hooks/wallet/use-wallet-portfolio";
import { queryKeys } from "@/lib/queries";
import { executeAsVault } from "@/lib/lazorkit/execute-as-vault";
import { parseSendIntent } from "@/lib/wallet/parse-send";
import { formatSol, parseSolAmount } from "@/lib/wallet/sol";
import { transferSolInstruction } from "@/lib/wallet/transfer-sol";
import { tryParseAddress } from "@/lib/solana/address";
import { shortAddress } from "@/lib/utils";
import { toUserErrorMessage } from "@/lib/user-errors";

export function SendSheet({
  prompt,
  onBack,
}: {
  prompt: string;
  onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const { session } = useSmartWallet();
  const portfolio = useWalletPortfolio(session?.vaultPda ?? null);
  const nativeLamports = portfolio.data
    ? BigInt(portfolio.data.nativeLamports)
    : undefined;
  const parsed = parseSendIntent(prompt);

  const [destination, setDestination] = useState(parsed?.destination ?? "");
  const [amount, setAmount] = useState(
    parsed ? formatSol(parsed.lamports) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  const dest = tryParseAddress(destination);
  const lamports = parseSolAmount(amount);

  async function onConfirm() {
    if (!session || !dest || lamports == null || lamports <= 0n) return;
    setError(null);
    setBusy(true);
    try {
      const result = await executeAsVault({
        session,
        inner: [
          transferSolInstruction({
            from: session.vaultPda,
            to: dest,
            lamports,
          }),
        ],
      });
      setSignature(result.signature);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.walletPortfolio.byVault(String(session.vaultPda)),
      });
    } catch (err) {
      setError(toUserErrorMessage(err, "That didn’t go through. Try again."));
    } finally {
      setBusy(false);
    }
  }

  if (busy) {
    return <WalletBusyStatus connecting />;
  }

  if (signature) {
    return (
      <div className="flex flex-1 flex-col">
        <BackLink onClick={onBack} />
        <SuccessStatus
          icon={<Check className="size-7" />}
          title={`Sent ${formatSol(lamports ?? 0n)} SOL`}
          body={dest ? `To ${shortAddress(String(dest))}.` : "Done."}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <BackLink onClick={onBack} />
      <div className="space-y-1.5 text-center">
        <p className="text-base font-medium text-foreground">Send SOL</p>
        <p className="mx-auto max-w-72 text-sm text-muted-foreground">
          Confirm with Face ID. Network fees are covered.
        </p>
        {nativeLamports != null ? (
          <p className="text-xs text-muted-foreground">
            Available to send: {formatSol(nativeLamports)} SOL
          </p>
        ) : null}
      </div>
      <label className="space-y-1.5">
        <span className="text-xs text-muted-foreground">Amount</span>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder="0.5"
          className="h-11 w-full rounded-xl border border-border/60 bg-muted/40 px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>
      <label className="space-y-1.5">
        <span className="text-xs text-muted-foreground">To</span>
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Address"
          className="h-11 w-full rounded-xl border border-border/60 bg-muted/40 px-3 font-mono text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>
      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        size="lg"
        className="mt-auto w-full"
        disabled={!dest || lamports == null || lamports <= 0n}
        onClick={() => void onConfirm()}
      >
        {error ? "Try again" : "Confirm with Face ID"}
      </Button>
    </div>
  );
}
