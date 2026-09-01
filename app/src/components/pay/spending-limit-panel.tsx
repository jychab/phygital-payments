"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Coins, LoaderCircle } from "lucide-react";
import { address } from "@solana/kit";

import { AmountField } from "@/components/shared/amount-field";
import { BackLink } from "@/components/shared/back-link";
import { StickyActions } from "@/components/shared/sticky-actions";
import { ExpectedWalletConnect } from "@/components/shared/wallet-notices";
import { TokenSymbol } from "@/components/shared/token-chip";
import { Button } from "@/components/ui/button";
import { GateMessage } from "@/components/layout/gate-message";
import { useDelegateStatus } from "@/hooks/pay/use-delegate-status";
import { useMintProgram } from "@/hooks/tokens/use-mint-program";
import {
  useSetDelegateMutation,
  useRevokeDelegateMutation,
} from "@/hooks/pay/use-delegate-mutations";
import {
  isDelegateEnabled,
  uiAmountToRaw,
  type OwnerPayMintMatch,
} from "@/lib/tokens/mint-delegate";
import {
  isDefaultMint,
  resolvePaymentToken,
  type PaymentTokenHolding,
} from "@/lib/tokens/payment-token";
import { toUserErrorMessage } from "@/lib/user-errors";
import { useExpectedWallet } from "@/hooks/wallet/use-expected-wallet";

const DEFAULT_LIMIT_AMOUNT = "50";

function tryUiAmountToRaw(amount: string, decimals: number): bigint | null {
  try {
    return uiAmountToRaw(amount, decimals);
  } catch {
    return null;
  }
}

/**
 * Set or update the spending limit for one mint on one NFC accessory
 * (program-authority SPL delegate).
 */
export function SpendingLimitPanel({
  owner,
  tokenAddress,
  mint,
  holding: holdingProp,
  walletMatch,
  live = true,
  onEnabled,
  onBack,
}: {
  owner: string;
  tokenAddress: string;
  mint: string;
  holding?: PaymentTokenHolding;
  /** Home Pay already scanned this mint — skip a second delegateStatus RPC. */
  walletMatch?: OwnerPayMintMatch;
  live?: boolean;
  onEnabled?: () => void;
  onBack?: () => void;
}) {
  const { address: walletAddress, matched, ownerShort } =
    useExpectedWallet(owner);
  const mintAddress = address(mint);
  const [amount, setAmount] = useState(DEFAULT_LIMIT_AMOUNT);

  const seeded =
    walletMatch?.status &&
    walletMatch.token &&
    String(walletMatch.token) === tokenAddress
      ? walletMatch.status
      : undefined;
  const statusQuery = useDelegateStatus(owner, tokenAddress, mintAddress, {
    live,
    enabled: !seeded,
  });
  const mintQuery = useMintProgram(mintAddress);
  const status = seeded ?? statusQuery.data;

  const holding = holdingProp;
  const token = holding ?? resolvePaymentToken(mint);
  const setAllowance = useSetDelegateMutation(
    walletAddress === owner ? walletAddress : null,
    { mint: mintAddress, token: tokenAddress },
  );
  const revoke = useRevokeDelegateMutation(
    walletAddress === owner ? walletAddress : null,
    { mint: mintAddress, token: tokenAddress },
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
      toast.success("Spending limit saved");
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
        {onBack ? (
          <div className="flex items-center gap-2">
            <BackLink onClick={onBack} />
          </div>
        ) : null}
        <GateMessage
          icon={<Coins className="size-5 text-muted-foreground" />}
          title={`Add ${token.symbol} first`}
          body={
            isDefaultMint(mint)
              ? "Add USDC to this wallet first."
              : "Add some of this token to this wallet first."
          }
          action={
            <div className="flex w-full max-w-xs flex-col gap-2">
              {!matched ? (
                <ExpectedWalletConnect
                  owner={owner}
                  hint={`Connect ${ownerShort} to continue.`}
                  disabled={busy}
                />
              ) : null}
              {onBack ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="w-full max-w-xs"
                  onClick={onBack}
                >
                  Back
                </Button>
              ) : null}
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {onBack ? (
        <div className="flex items-center gap-2">
          <BackLink onClick={onBack} />
        </div>
      ) : null}

      <div className="space-y-1.5 text-center">
        <h1 className="font-(family-name:--font-display) text-2xl tracking-tight">
          Spending limit
        </h1>
        <p className="mx-auto max-w-72 text-sm text-muted-foreground">
          This accessory can spend up to this much{" "}
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
        disabled={busy}
        autoFocus={matched}
        caption="Spending limit"
        className="py-1"
      />

      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] tabular-nums text-muted-foreground">
        From this wallet
        {status ? (
          <>
            <span>·</span>
            <span>{status.balanceUi}</span>
            <TokenSymbol token={token} size="xs" />
          </>
        ) : holding ? (
          <>
            <span>·</span>
            <span>{holding.balanceUi}</span>
            <TokenSymbol token={token} size="xs" />
          </>
        ) : null}
      </p>

      <StickyActions>
        {!matched ? (
          <ExpectedWalletConnect
            owner={owner}
            hint={`Connect ${ownerShort} to change this limit.`}
            disabled={busy}
          />
        ) : (
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
                Confirm in wallet…
              </>
            ) : hasDelegate ? (
              <>
                <Check className="size-4" />
                {cta}
              </>
            ) : (
              cta
            )}
          </Button>
        )}
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
      </StickyActions>
    </div>
  );
}
