"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { address } from "@solana/kit";
import { Check, LoaderCircle } from "lucide-react";

import { AmountField } from "@/components/amount-field";
import { Button } from "@/components/ui/button";
import { explorerTxUrl } from "@/lib/solana/cluster";
import { sendTransaction } from "@/lib/solana/tx";
import {
  buildDelegateInstructions,
  buildRevokeDelegateInstructions,
  fetchUsdcDelegateStatus,
  resolveMintProgram,
  uiAmountToRaw,
  type UsdcDelegateStatus,
} from "@/lib/payments/fund";
import { getUsdcMint } from "@/lib/payments/usdc";
import { useWalletSigner } from "@/lib/wallet/wallet-context";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { cn } from "@/lib/utils";

export function FundPanel() {
  const signer = useWalletSigner();
  const { address: walletAddress, isConnected } = useSolanaAddress();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<UsdcDelegateStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [pending, setPending] = useState<"approve" | "revoke" | null>(null);

  const usdcMint = getUsdcMint();

  const refreshStatus = useCallback(async () => {
    if (!walletAddress) {
      setStatus(null);
      return;
    }
    setStatusLoading(true);
    try {
      const next = await fetchUsdcDelegateStatus(address(walletAddress));
      setStatus(next);
    } catch (error) {
      console.error(error);
      setStatus(null);
    } finally {
      setStatusLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  async function onDelegate() {
    if (!signer || !isConnected) {
      toast.error("Connect a wallet first");
      return;
    }
    setPending("approve");
    try {
      const { decimals } = await resolveMintProgram(usdcMint);
      const rawAmount = uiAmountToRaw(amount, decimals);
      const { instructions } = await buildDelegateInstructions({
        signer,
        rawAmount,
      });
      const { signature } = await sendTransaction({
        instructions,
        feePayer: signer,
      });
      toast.success("Allowance updated", {
        description: (
          <a
            className="underline"
            href={explorerTxUrl(signature)}
            target="_blank"
            rel="noreferrer"
          >
            View on Explorer
          </a>
        ),
      });
      setAmount("");
      await refreshStatus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn’t update allowance");
    } finally {
      setPending(null);
    }
  }

  async function onRevoke() {
    if (!signer || !isConnected) {
      toast.error("Connect a wallet first");
      return;
    }
    setPending("revoke");
    try {
      const { instructions } = await buildRevokeDelegateInstructions({
        signer,
      });
      const { signature } = await sendTransaction({
        instructions,
        feePayer: signer,
      });
      toast.success("Allowance removed", {
        description: (
          <a
            className="underline"
            href={explorerTxUrl(signature)}
            target="_blank"
            rel="noreferrer"
          >
            View on Explorer
          </a>
        ),
      });
      await refreshStatus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn’t remove allowance");
    } finally {
      setPending(null);
    }
  }

  const hasDelegate =
    !!status?.isProgramAuthorityDelegate && status.delegatedAmountRaw > BigInt(0);
  const allowanceLabel = hasDelegate ? status!.delegatedAmountUi : "0";
  const busy = pending !== null;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <section
        aria-live="polite"
        className={cn(
          "relative overflow-hidden rounded-[1.15rem] px-5 py-5",
          "bg-[linear-gradient(145deg,oklch(0.28_0.04_145)_0%,oklch(0.22_0.03_160)_55%,oklch(0.2_0.02_200)_100%)]",
          "ring-1 ring-white/8",
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-[radial-gradient(circle,oklch(0.86_0.2_130/0.22),transparent_70%)]"
        />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">
              Spending allowance
            </p>
            {statusLoading && !status ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-white/60">
                <LoaderCircle className="size-3.5 animate-spin" />
                Checking…
              </p>
            ) : (
              <p className="mt-2 font-[family-name:var(--font-display)] text-[2rem] leading-none tracking-tight tabular-nums">
                {allowanceLabel}
                <span className="ml-1.5 text-base font-medium text-white/50">
                  USDC
                </span>
              </p>
            )}
          </div>
          <div
            className={cn(
              "mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium",
              hasDelegate
                ? "bg-primary/20 text-primary"
                : "bg-white/8 text-white/55",
            )}
          >
            {hasDelegate ? (
              <>
                <Check className="size-3" strokeWidth={2.5} />
                Ready
              </>
            ) : (
              "Not set"
            )}
          </div>
        </div>
        <p className="relative mt-4 text-xs leading-relaxed text-white/45">
          {hasDelegate
            ? "Your pass can authorize payments up to this amount. Tokens remain in your wallet until spent."
            : "No active allowance. Set an amount below so a tap can settle USDC."}
        </p>
        {status ? (
          <p className="relative mt-3 text-[11px] tabular-nums text-white/35">
            Wallet balance · {status.balanceUi} USDC
          </p>
        ) : null}
      </section>

      <div className="flex flex-1 flex-col gap-5">
        <div>
          <p className="mb-1 text-center text-xs font-medium text-muted-foreground">
            {hasDelegate ? "Update allowance" : "Set allowance"}
          </p>
          <AmountField
            id="fund-amount"
            value={amount}
            onChange={setAmount}
            disabled={busy}
          />
        </div>

        <div className="mt-auto flex flex-col gap-2.5">
          <Button
            type="button"
            size="lg"
            className="h-11 w-full text-[0.9375rem]"
            onClick={onDelegate}
            disabled={!isConnected || busy || !amount}
          >
            {pending === "approve" ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Confirm in wallet…
              </>
            ) : hasDelegate ? (
              "Update allowance"
            ) : (
              "Set allowance"
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="h-10 w-full text-muted-foreground hover:text-destructive"
            onClick={onRevoke}
            disabled={!isConnected || busy || !hasDelegate}
          >
            {pending === "revoke" ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Removing…
              </>
            ) : (
              "Remove allowance"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
