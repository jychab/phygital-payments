"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, LoaderCircle } from "lucide-react";

import { AmountField } from "@/components/amount-field";
import { Button } from "@/components/ui/button";
import { explorerTxUrl } from "@/lib/solana/cluster";
import { uiAmountToRaw } from "@/lib/payments/fund";
import { getUsdcMint } from "@/lib/payments/usdc";
import { useDelegateStatus } from "@/hooks/use-delegate-status";
import { useMintProgram } from "@/hooks/use-mint-program";
import {
  useRevokeAllowanceMutation,
  useSetAllowanceMutation,
} from "@/hooks/use-allowance-mutations";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { cn } from "@/lib/utils";

function explorerToast(title: string, signature: string) {
  toast.success(title, {
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
}

export function FundPanel() {
  const { address: walletAddress, isConnected } = useSolanaAddress();
  const [amount, setAmount] = useState("");

  const usdcMint = getUsdcMint();
  const statusQuery = useDelegateStatus(walletAddress);
  const mintQuery = useMintProgram(usdcMint);
  const status = statusQuery.data;

  const setAllowance = useSetAllowanceMutation(walletAddress, {
    onSuccess: (signature) => {
      explorerToast("Allowance updated", signature);
      setAmount("");
    },
  });
  const revoke = useRevokeAllowanceMutation(walletAddress, {
    onSuccess: (signature) => explorerToast("Allowance removed", signature),
  });

  async function onDelegate() {
    if (!isConnected) {
      toast.error("Open this from your vault first");
      return;
    }
    if (!mintQuery.data) {
      toast.error("Still loading — try again in a moment");
      return;
    }
    try {
      const rawAmount = uiAmountToRaw(amount, mintQuery.data.decimals);
      await setAllowance.mutateAsync({
        rawAmount,
        decimals: mintQuery.data.decimals,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn’t update allowance",
      );
    }
  }

  async function onRevoke() {
    try {
      await revoke.mutateAsync();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn’t remove allowance",
      );
    }
  }

  const hasDelegate =
    !!status?.isProgramAuthorityDelegate && status.delegatedAmountRaw > BigInt(0);
  const allowanceLabel = hasDelegate ? status!.delegatedAmountUi : "0";
  const statusLoading = statusQuery.isLoading;
  const busy = setAllowance.isPending || revoke.isPending;

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
          className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--accent-glow)_22%,transparent),transparent_70%)]"
        />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">
              Allowance
            </p>
            {statusLoading ? (
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
        {status ? (
          <p className="relative mt-4 text-[11px] tabular-nums text-white/40">
            Balance · {status.balanceUi} USDC
          </p>
        ) : null}
      </section>

      <div className="flex flex-1 flex-col gap-5">
        <AmountField
          id="fund-amount"
          value={amount}
          onChange={setAmount}
          disabled={busy}
        />

        <div className="mt-auto flex flex-col gap-2.5">
          <Button
            type="button"
            size="lg"
            className="h-11 w-full text-[0.9375rem]"
            onClick={onDelegate}
            disabled={!isConnected || busy || !amount}
          >
            {setAllowance.isPending ? (
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
            {revoke.isPending ? (
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
