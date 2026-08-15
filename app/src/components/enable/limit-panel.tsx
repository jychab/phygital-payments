"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, LoaderCircle, Lock, ShieldCheck } from "lucide-react";

import { AmountField } from "@/components/amount-field";
import { AmountPresets } from "@/components/amount-presets";
import { Button } from "@/components/ui/button";
import { useDelegateStatus } from "@/hooks/use-delegate-status";
import { useMintProgram } from "@/hooks/use-mint-program";
import { useSetAllowanceMutation } from "@/hooks/use-allowance-mutations";
import { uiAmountToRaw } from "@/lib/payments/usdc-allowance";
import { useDevicePayKeyHelpers } from "@/lib/payments/provision-client";
import { getUsdcMint } from "@/lib/payments/usdc";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";

const PRESETS = ["20", "50", "100"] as const;

/**
 * One-time Enable Pay step: pick a spending limit, approve in wallet,
 * and silently provision a device pay key.
 */
export function LimitPanel({ onEnabled }: { onEnabled?: () => void }) {
  const { address: walletAddress, isConnected } = useSolanaAddress();
  const { ensureKey } = useDevicePayKeyHelpers();
  const [amount, setAmount] = useState("50");
  const [provisioning, setProvisioning] = useState(false);

  const usdcMint = getUsdcMint();
  const statusQuery = useDelegateStatus(walletAddress);
  const mintQuery = useMintProgram(usdcMint);
  const status = statusQuery.data;

  const setAllowance = useSetAllowanceMutation(walletAddress);

  const hasDelegate =
    !!status?.isProgramAuthorityDelegate && status.delegatedAmountRaw > BigInt(0);
  const busy =
    setAllowance.isPending || provisioning || statusQuery.isLoading;

  async function onEnable() {
    if (!isConnected || !walletAddress) {
      toast.error("Sign in to continue");
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
      setProvisioning(true);
      try {
        await ensureKey(walletAddress);
      } catch (error) {
        toast.error(
          toUserErrorMessage(
            error,
            "Limit saved, but this phone isn’t ready to pay yet. Try again.",
          ),
        );
        return;
      } finally {
        setProvisioning(false);
      }
      toast.success("Pay is on");
      onEnabled?.();
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t turn on Pay"));
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="space-y-1.5 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Enable Pay
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
          Allow up to how much?
        </h1>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          Your NFC device can spend up to this amount when you tap to pay. Change
          it anytime.
        </p>
      </div>

      <AmountField
        id="enable-limit"
        value={amount}
        onChange={setAmount}
        disabled={busy}
        autoFocus
      />

      <AmountPresets
        value={amount}
        onChange={setAmount}
        presets={PRESETS}
        disabled={busy}
      />

      <div className="flex items-start gap-2.5 rounded-xl bg-muted/30 px-4 py-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary/80" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Nothing leaves your balance until you hold your NFC device to a
          merchant. You stay in control.
        </p>
      </div>

      {status ? (
        <p className="text-center text-[11px] tabular-nums text-muted-foreground">
          Balance · {status.balanceUi} USDC
          {hasDelegate ? ` · Current limit ${status.delegatedAmountUi}` : null}
        </p>
      ) : null}

      <div className="mt-auto flex flex-col gap-2.5">
        <Button
          type="button"
          size="lg"
          className="h-11 w-full text-[0.9375rem]"
          onClick={onEnable}
          disabled={!isConnected || busy || !amount}
        >
          {setAllowance.isPending || provisioning ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              {provisioning ? "Finishing…" : "Confirm in wallet…"}
            </>
          ) : hasDelegate ? (
            <>
              <Check className="size-4" />
              Update limit
            </>
          ) : (
            "Turn on Pay"
          )}
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground/80">
          <Lock className="size-3" strokeWidth={2.25} />
          Confirmed with your signed-in account
        </p>
      </div>
    </div>
  );
}
