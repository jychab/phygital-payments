"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, ChevronLeft, LoaderCircle, Lock } from "lucide-react";
import { address, type Address } from "@solana/kit";

import { AmountField } from "@/components/amount-field";
import { AmountPresets } from "@/components/amount-presets";
import { TokenListRow, TokenSymbol } from "@/components/token-chip";
import { Button } from "@/components/ui/button";
import { useDelegateStatus, useDelegateStatuses } from "@/hooks/use-delegate-status";
import { useMintProgram } from "@/hooks/use-mint-program";
import { useSetDelegateMutation, useRevokeDelegateMutation } from "@/hooks/use-delegate-mutations";
import { useTokenHoldings, useVerifiedTokens } from "@/hooks/use-verified-tokens";
import {
  isDelegateEnabled,
  uiAmountToRaw,
} from "@/lib/payments/mint-delegate";
import {
  PAY_AMOUNT_PRESETS,
  resolvePaymentToken,
  type PaymentTokenHolding,
} from "@/lib/payments/payment-token";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { shortAddress } from "@/lib/utils";

/**
 * Pick a spending limit for a mint (program-authority delegate).
 */
export function LimitPanel({
  expectedOwner,
  mint: mintProp,
  onEnabled,
  onBack,
  onSkip,
}: {
  expectedOwner: string;
  mint: Address | string;
  onEnabled?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
}) {
  const { address: walletAddress, isConnected } = useSolanaAddress();
  const mint = String(mintProp);
  const mintAddress = address(mint);
  const [amount, setAmount] = useState("50");

  const statusQuery = useDelegateStatus(expectedOwner, mintAddress);
  const mintQuery = useMintProgram(mintAddress);
  const holdings = useTokenHoldings(expectedOwner);
  const verified = useVerifiedTokens();
  const status = statusQuery.data;

  const holding = holdings.data?.find(
    (h: PaymentTokenHolding) => h.mint === mint,
  );
  const token =
    holding ??
    resolvePaymentToken(mint, verified.data);
  const setAllowance = useSetDelegateMutation(
    walletAddress === expectedOwner ? walletAddress : null,
    { mint: mintAddress },
  );
  const revoke = useRevokeDelegateMutation(
    walletAddress === expectedOwner ? walletAddress : null,
    { mint: mintAddress },
  );

  const hasDelegate = isDelegateEnabled(status);
  const wrongWallet =
    isConnected && walletAddress != null && walletAddress !== expectedOwner;
  const matched = isConnected && walletAddress === expectedOwner;
  const busy = setAllowance.isPending || revoke.isPending || statusQuery.isLoading;

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
      toast.success("Spending limit set");
      onEnabled?.();
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t save spending limit"));
    }
  }

  async function runRemove() {
    if (!walletAddress || walletAddress !== expectedOwner) return;
    try {
      await revoke.mutateAsync();
      toast.success("Spending limit removed");
      onEnabled?.();
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn't remove spending limit"));
    }
  }

  const cta = (() => {
    if (setAllowance.isPending) return null;
    if (hasDelegate) return "Update Limit";
    return "Set Limit";
  })();

  return (
    <div className="flex flex-1 flex-col gap-6">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 self-start text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          Back
        </button>
      ) : null}

      <div className="space-y-1.5 text-center">
        <h1 className="font-(family-name:--font-display) text-2xl tracking-tight">
          Set Spending Limit
        </h1>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          This wallet can spend up to this much{" "}
          <TokenSymbol
            token={token}
            size="xs"
            className="mx-0.5"
            symbolClassName="font-medium text-foreground"
          />{" "}
          when any of your NFC devices tap to pay. Change it anytime.
        </p>
      </div>

      <AmountField
        id="enable-limit"
        value={amount}
        onChange={setAmount}
        token={token}
        decimals={mintQuery.data?.decimals ?? token.decimals}
        disabled={busy || !matched}
        autoFocus={matched}
      />

      <AmountPresets
        value={amount}
        onChange={setAmount}
        presets={PAY_AMOUNT_PRESETS}
        disabled={busy || !matched}
      />

      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] tabular-nums text-muted-foreground">
        From {shortAddress(expectedOwner, 4)}
        {status ? (
          <>
            <span>·</span>
            <span>{status.balanceUi}</span>
            <TokenSymbol token={token} size="xs" />
          </>
        ) : null}
      </p>
      {!isConnected ? (
        <p className="rounded-xl border border-border/60 bg-muted/25 px-3 py-2 text-center text-xs text-muted-foreground">
          Connect {shortAddress(expectedOwner, 4)} above to continue.
        </p>
      ) : wrongWallet ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
          Wrong wallet. Disconnect above, then connect{" "}
          {shortAddress(expectedOwner, 4)}.
        </p>
      ) : null}

      <div className="mt-auto flex flex-col gap-2.5">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => void runEnable()}
          disabled={busy || !amount || !matched}
        >
          {setAllowance.isPending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Confirm spending limit in wallet…
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
        {matched ? (
          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground/80">
            <Lock className="size-3" strokeWidth={2.25} />
            You&apos;ll confirm in your wallet
          </p>
        ) : null}
        {hasDelegate && matched ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full text-muted-foreground hover:text-destructive"
            onClick={() => void runRemove()}
            disabled={busy}
          >
            {revoke.isPending ? "Removing…" : "Remove spending limit"}
          </Button>
        ) : null}
        {onSkip ? (
          <Button type="button" variant="ghost" size="lg" className="w-full" onClick={onSkip}>
            Not Now
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/** Compact list of holdings for enabling additional Pay instruments. */
export function ManagePayTokens({
  owner,
  onEditLimit,
}: {
  owner: string;
  onEditLimit: (holding: PaymentTokenHolding) => void;
}) {
  const holdings = useTokenHoldings(owner);
  const mints = holdings.data?.map((h: PaymentTokenHolding) => h.mint) ?? [];
  const statuses = useDelegateStatuses(owner, mints);

  if (holdings.isLoading || statuses.isLoading) {
    return (
      <div className="flex justify-center py-6 text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
      </div>
    );
  }

  const list = holdings.data ?? [];
  if (list.length === 0) {
    return (
      <p className="px-2 py-4 text-center text-xs text-muted-foreground">
        No verified tokens found for this wallet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {list.map((h: PaymentTokenHolding) => {
        const status = statuses.data?.get(h.mint);
        const enabled = isDelegateEnabled(status);
        return (
          <li key={h.mint}>
            <TokenListRow
              token={h}
              subtitle={
                enabled
                  ? `Limit ${status?.delegatedAmountUi ?? "—"} · bal ${h.balanceUi}`
                  : `Not enabled · bal ${h.balanceUi}`
              }
              onSelect={() => onEditLimit(h)}
              trailing={
                <span className="text-[11px] font-medium text-primary">
                  {enabled ? "Edit" : "Enable"}
                </span>
              }
            />
          </li>
        );
      })}
    </ul>
  );
}
