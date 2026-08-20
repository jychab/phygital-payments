"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Coins, LoaderCircle } from "lucide-react";
import { address } from "@solana/kit";

import { AmountField } from "@/components/shared/amount-field";
import { BackLink } from "@/components/shared/back-link";
import { ConnectWalletNotice } from "@/components/shared/wallet-notices";
import { QueryRefreshButton } from "@/components/shared/query-refresh-button";
import { TokenSymbol } from "@/components/shared/token-chip";
import { Button } from "@/components/ui/button";
import { GateMessage } from "@/components/layout/gate-message";
import { useDelegateStatus } from "@/hooks/pay/use-delegate-status";
import { useMintProgram } from "@/hooks/tokens/use-mint-program";
import {
  useSetDelegateMutation,
  useRevokeDelegateMutation,
} from "@/hooks/pay/use-delegate-mutations";
import { useVerifiedTokens } from "@/hooks/tokens/use-payment-tokens";
import {
  isDelegateEnabled,
  uiAmountToRaw,
  type OwnerPayMintMatch,
} from "@/lib/tokens/mint-delegate";
import {
  resolvePaymentToken,
  type PaymentTokenHolding,
} from "@/lib/tokens/payment-token";
import { toUserErrorMessage } from "@/lib/user-errors";
import { useExpectedWallet } from "@/hooks/wallet/use-expected-wallet";
import { shortAddress } from "@/lib/utils";

function tryUiAmountToRaw(amount: string, decimals: number): bigint | null {
  try {
    return uiAmountToRaw(amount, decimals);
  } catch {
    return null;
  }
}

/**
 * Set or update the spending limit for one mint on one NFC device
 * (program-authority SPL delegate).
 */
export function SpendingLimitPanel({
  owner,
  asset,
  mint,
  holding: holdingProp,
  walletMatch,
  live = true,
  onEnabled,
  onBack,
  onSkip,
}: {
  owner: string;
  asset: string;
  mint: string;
  holding?: PaymentTokenHolding;
  /** Home Pay already scanned this mint — skip a second delegateStatus RPC. */
  walletMatch?: OwnerPayMintMatch;
  live?: boolean;
  onEnabled?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
}) {
  const { address: walletAddress, isConnected, matched, ownerShort } =
    useExpectedWallet(owner);
  const mintAddress = address(mint);
  const [amount, setAmount] = useState("50");

  const seeded =
    walletMatch?.status &&
    walletMatch.asset &&
    String(walletMatch.asset) === asset
      ? walletMatch.status
      : undefined;
  const statusQuery = useDelegateStatus(owner, asset, mintAddress, {
    live,
    enabled: !seeded,
  });
  const mintQuery = useMintProgram(mintAddress);
  const verified = useVerifiedTokens();
  const status = seeded ?? statusQuery.data;

  const holding = holdingProp;
  const token = holding ?? resolvePaymentToken(mint, verified.data);
  const setAllowance = useSetDelegateMutation(
    walletAddress === owner ? walletAddress : null,
    { mint: mintAddress, asset },
  );
  const revoke = useRevokeDelegateMutation(
    walletAddress === owner ? walletAddress : null,
    { mint: mintAddress, asset },
  );

  const hasDelegate = isDelegateEnabled(status);
  const balanceRaw =
    status?.balanceRaw ??
    (holding ? BigInt(holding.balanceRaw) : BigInt(0));
  const needsBalance = !hasDelegate && balanceRaw <= BigInt(0);
  const busy =
    setAllowance.isPending ||
    revoke.isPending ||
    (!seeded && statusQuery.isLoading);
  const decimals = mintQuery.data?.decimals ?? token.decimals;

  const limitRaw = tryUiAmountToRaw(amount, decimals);

  async function runEnable() {
    if (!walletAddress || walletAddress !== owner) return;
    if (!mintQuery.data) {
      toast.error("Still loading. Try again in a moment.");
      return;
    }
    if (limitRaw == null) {
      toast.error("Enter a valid amount");
      return;
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
      toast.success("Spending limit saved.");
      onEnabled?.();
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t save spending limit"));
    }
  }

  async function runRemove() {
    if (!walletAddress || walletAddress !== owner) return;
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
    busy || !amount || limitRaw == null || !matched || needsBalance;

  if (needsBalance) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center gap-2">
          {onBack ? <BackLink onClick={onBack} /> : null}
          <QueryRefreshButton owner={owner} className="ml-auto" />
        </div>
        <GateMessage
          icon={<Coins className="size-5 text-muted-foreground" />}
          title={`Add ${token.symbol} first`}
          body="This wallet needs a balance before you can set a spending limit for Pay."
          action={
            onSkip ? (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="w-full max-w-xs"
                onClick={onSkip}
              >
                Not Now
              </Button>
            ) : onBack ? (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="w-full max-w-xs"
                onClick={onBack}
              >
                Back
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center gap-2">
        {onBack ? <BackLink onClick={onBack} /> : null}
        <QueryRefreshButton owner={owner} className="ml-auto" />
      </div>

      <div className="space-y-1.5 text-center">
        <h1 className="font-(family-name:--font-display) text-2xl tracking-tight">
          Set Spending Limit
        </h1>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          Payments from this device can use up to this much{" "}
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
        caption="Spending limit"
        className="py-1"
      />

      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] tabular-nums text-muted-foreground">
        From {shortAddress(owner, 4)}
        {status ? (
          <>
            <span>·</span>
            <span>{status.balanceUi}</span>
            <TokenSymbol token={token} size="xs" />
          </>
        ) : null}
      </p>
      {!isConnected ? <ConnectWalletNotice ownerShort={ownerShort} /> : null}

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
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={onSkip}
          >
            Not Now
          </Button>
        ) : null}
      </div>
    </div>
  );
}
