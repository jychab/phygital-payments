"use client";

import { useState } from "react";
import { useIsRestoring } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, LoaderCircle } from "lucide-react";
import { address, type Address } from "@solana/kit";

import { AmountField } from "@/components/shared/amount-field";
import { BackLink } from "@/components/shared/back-link";
import { TokenListRow, TokenSymbol } from "@/components/shared/token-chip";
import { Button } from "@/components/ui/button";
import { useDelegateStatus, useDelegateStatuses } from "@/hooks/pay/use-delegate-status";
import { useMaxTapAmountUi } from "@/hooks/pay/use-max-tap-amount";
import { useMintProgram } from "@/hooks/tokens/use-mint-program";
import { useSetDelegateMutation, useRevokeDelegateMutation } from "@/hooks/pay/use-delegate-mutations";
import { usePayTokenContext, useTokenHoldings, useVerifiedTokens } from "@/hooks/tokens/use-verified-tokens";
import {
  isDelegateEnabled,
  uiAmountToRaw,
} from "@/lib/tokens/mint-delegate";
import {
  parseMaxTapAmountUi,
  storeMaxTapAmountUi,
} from "@/lib/pay/max-tap-store";
import {
  PAY_AMOUNT_PRESETS,
  defaultTapAmountUi,
  isDefaultMint,
  resolvePaymentToken,
  type PaymentTokenHolding,
} from "@/lib/tokens/payment-token";
import { toUserErrorMessage } from "@/lib/user-errors";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import { shortAddress } from "@/lib/utils";

function tryUiAmountToRaw(amount: string, decimals: number): bigint | null {
  try {
    return uiAmountToRaw(amount, decimals);
  } catch {
    return null;
  }
}

/**
 * Pick a spending limit for a mint (program-authority delegate).
 * USDC also sets this phone’s max tap amount (localStorage).
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
  const showMaxTap = isDefaultMint(mint);
  const storedMaxTap = useMaxTapAmountUi(expectedOwner);
  const [amount, setAmount] = useState("50");
  const [maxTap, setMaxTap] = useState(storedMaxTap);

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
  const decimals = mintQuery.data?.decimals ?? token.decimals;

  const parsedMaxTap = showMaxTap ? parseMaxTapAmountUi(maxTap) : null;
  const limitRaw = tryUiAmountToRaw(amount, decimals);
  const maxTapRaw = parsedMaxTap ? tryUiAmountToRaw(parsedMaxTap, decimals) : null;
  const maxTapOverLimit =
    showMaxTap &&
    limitRaw != null &&
    maxTapRaw != null &&
    maxTapRaw > limitRaw;

  async function runEnable() {
    if (!walletAddress || walletAddress !== expectedOwner) return;
    if (!mintQuery.data) {
      toast.error("Still loading. Try again in a moment.");
      return;
    }
    if (limitRaw == null) {
      toast.error("Enter a valid amount");
      return;
    }
    if (showMaxTap) {
      if (!parsedMaxTap || maxTapRaw == null) {
        toast.error("Enter a valid max tap amount");
        return;
      }
      if (maxTapOverLimit) {
        toast.error("Max tap can’t be more than your spending limit.");
        return;
      }
    }
    try {
      const limitChanged =
        !hasDelegate ||
        status?.delegatedAmountRaw == null ||
        status.delegatedAmountRaw !== limitRaw;
      if (limitChanged) {
        await setAllowance.mutateAsync({
          rawAmount: limitRaw,
          decimals: mintQuery.data.decimals,
        });
      }
      if (showMaxTap && parsedMaxTap) {
        storeMaxTapAmountUi(expectedOwner, parsedMaxTap);
      }
      toast.success(
        showMaxTap
          ? "Pay limits saved."
          : "Spending limit set",
      );
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
      toast.error(toUserErrorMessage(error, "Couldn’t remove spending limit"));
    }
  }

  const cta = (() => {
    if (setAllowance.isPending) return null;
    if (hasDelegate) return "Update Limit";
    return "Set Limit";
  })();

  const saveDisabled =
    busy ||
    !amount ||
    limitRaw == null ||
    !matched ||
    (showMaxTap && (!parsedMaxTap || maxTapOverLimit));

  return (
    <div className="flex flex-1 flex-col gap-6">
      {onBack ? <BackLink onClick={onBack} /> : null}

      <div className="space-y-1.5 text-center">
        <h1 className="font-(family-name:--font-display) text-2xl tracking-tight">
          Set Spending Limit
        </h1>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          Payments from your devices can use up to this much{" "}
          <TokenSymbol
            token={token}
            size="xs"
            className="mx-0.5"
            symbolClassName="font-medium text-foreground"
          />
          . You can change it anytime.
        </p>
      </div>

      <AmountField
        id="enable-limit"
        value={amount}
        onChange={setAmount}
        token={token}
        decimals={decimals}
        disabled={busy || !matched}
        autoFocus={matched}
        caption={showMaxTap ? "Spending limit" : undefined}
        className={showMaxTap ? "py-1" : undefined}
      />

  
      {showMaxTap ? (
        <>
          <AmountField
            id="max-tap-amount"
            value={maxTap}
            onChange={setMaxTap}
            token={token}
            decimals={decimals}
            disabled={busy || !matched}
            caption="Max tap amount"
            className="py-1"
          />
          {maxTapOverLimit ? (
            <p className="text-center text-[11px] text-destructive">
              Max tap can’t be more than your spending limit
            </p>
          ) : (
            <p className="text-center text-[11px] text-muted-foreground">
              Each payment from this phone can be up to this much.
            </p>
          )}
        </>
      ) : null}

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
          disabled={saveDisabled}
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
  const isRestoring = useIsRestoring();
  const payContext = usePayTokenContext(owner);
  const mints = payContext.data?.holdings.map((h) => h.mint) ?? [];
  const statuses = useDelegateStatuses(owner, mints);
  const maxTapUi = useMaxTapAmountUi(owner);

  if (isRestoring || payContext.isLoading || statuses.isLoading) {
    return (
      <div className="flex justify-center py-6 text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
      </div>
    );
  }

  const list = payContext.data?.holdings ?? [];
  if (list.length === 0) {
    return (
      <p className="px-2 py-4 text-center text-xs text-muted-foreground">
        No verified tokens in this wallet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {list.map((h: PaymentTokenHolding) => {
        const status = statuses.data?.get(h.mint);
        const enabled = isDelegateEnabled(status);
        const usdc = isDefaultMint(h.mint);
        const tapCap = usdc
          ? defaultTapAmountUi(status?.delegatedAmountUi, maxTapUi)
          : null;
        const subtitle = enabled
          ? usdc
            ? `Limit $${status?.delegatedAmountUi ?? "—"} · Max tap $${tapCap} · ${h.balanceUi} available`
            : `Limit $${status?.delegatedAmountUi ?? "—"} · ${h.balanceUi} available`
          : `Off · ${h.balanceUi} available`;
        return (
          <li key={h.mint}>
            <TokenListRow
              token={h}
              subtitle={subtitle}
              onSelect={() => onEditLimit(h)}
              trailing={
                <span className="text-[11px] font-medium text-primary">
                  {enabled ? "Edit" : "Turn On"}
                </span>
              }
            />
          </li>
        );
      })}
    </ul>
  );
}
