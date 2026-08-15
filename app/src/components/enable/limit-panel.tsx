"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, LoaderCircle, Lock } from "lucide-react";

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
import { shortAddress } from "@/lib/utils";

const PRESETS = ["20", "50", "100"] as const;

/**
 * Pick a spending limit; connect-if-needed, then approve + provision.
 */
export function LimitPanel({
  expectedOwner,
  onEnabled,
}: {
  expectedOwner: string;
  onEnabled?: () => void;
}) {
  const { address: walletAddress, isConnected, connect, ready } =
    useSolanaAddress();
  const { ensureKey } = useDevicePayKeyHelpers();
  const [amount, setAmount] = useState("50");
  const [provisioning, setProvisioning] = useState(false);

  const statusQuery = useDelegateStatus(expectedOwner);
  const mintQuery = useMintProgram(getUsdcMint());
  const status = statusQuery.data;

  const setAllowance = useSetAllowanceMutation(
    walletAddress === expectedOwner ? walletAddress : null,
  );

  const hasDelegate =
    !!status?.isProgramAuthorityDelegate && status.delegatedAmountRaw > BigInt(0);
  const wrongWallet =
    isConnected && walletAddress != null && walletAddress !== expectedOwner;
  const needsConnect = !isConnected || wrongWallet;
  const busy = setAllowance.isPending || provisioning || statusQuery.isLoading;
  const matched = isConnected && walletAddress === expectedOwner;

  async function runEnable() {
    if (!walletAddress || walletAddress !== expectedOwner) return;
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

  function onEnable() {
    if (!amount || !ready) return;
    if (!matched) {
      if (wrongWallet) {
        toast.error(
          `Switch to ${shortAddress(expectedOwner, 4)} — that’s the wallet this device pays from.`,
        );
      }
      connect();
      return;
    }
    void runEnable();
  }

  const cta = (() => {
    if (setAllowance.isPending || provisioning) return null;
    if (wrongWallet) return `Switch to ${shortAddress(expectedOwner, 4)}`;
    if (!isConnected) return "Continue";
    if (hasDelegate) return "Update limit";
    return "Turn on Pay";
  })();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="space-y-1.5 text-center">
        <h1 className="font-(family-name:--font-display) text-2xl tracking-tight">
          Allow up to how much?
        </h1>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          Your NFC device can spend up to this amount when you tap to pay.
          Change it anytime.
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

      <p className="text-center text-[11px] tabular-nums text-muted-foreground">
        From {shortAddress(expectedOwner, 4)}
        {status ? ` · ${status.balanceUi} USDC` : null}
      </p>

      {wrongWallet ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
          Connected wallet doesn’t match. Connect{" "}
          {shortAddress(expectedOwner, 4)}.
        </p>
      ) : null}

      <div className="mt-auto flex flex-col gap-2.5">
        <Button
          type="button"
          size="lg"
          className="h-11 w-full text-[0.9375rem]"
          onClick={onEnable}
          disabled={busy || !amount || !ready}
        >
          {setAllowance.isPending || provisioning ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              {provisioning ? "Finishing…" : "Confirm in wallet…"}
            </>
          ) : hasDelegate && matched ? (
            <>
              <Check className="size-4" />
              {cta}
            </>
          ) : (
            cta
          )}
        </Button>
        {needsConnect ? (
          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground/80">
            <Lock className="size-3" strokeWidth={2.25} />
            You’ll confirm in your wallet
          </p>
        ) : null}
      </div>
    </div>
  );
}
