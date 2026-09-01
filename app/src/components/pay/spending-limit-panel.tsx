"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Check, Coins, LoaderCircle } from "lucide-react";
import { address } from "@solana/kit";

import { AmountField } from "@/components/shared/amount-field";
import { BackLink } from "@/components/shared/back-link";
import { StickyActions } from "@/components/shared/sticky-actions";
import { ExpectedWalletConnect } from "@/components/shared/wallet-notices";
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
  needsAtaBeforeDelegate,
  uiAmountToRaw,
} from "@/lib/tokens/mint-delegate";
import {
  resolvePaymentToken,
  type PaymentTokenHolding,
} from "@/lib/tokens/payment-token";
import { copy } from "@/lib/copy/phygital";
import { toUserErrorMessage } from "@/lib/user-errors";
import { useExpectedWallet } from "@/hooks/wallet/use-expected-wallet";

const DEFAULT_LIMIT_AMOUNT = "50";

const PayAtaSetup = dynamic(
  () =>
    import("@/components/pay/pay-ata-setup").then((m) => m.PayAtaSetup),
  {
    ssr: false,
    loading: () => (
      <div className="flex w-full max-w-xs justify-center py-2">
        <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

/**
 * Set or update the pay allowance for one mint on one NFC accessory
 * (program-authority SPL delegate).
 */
export function SpendingLimitPanel({
  owner,
  tokenAddress,
  mint,
  holding,
  live = true,
  onEnabled,
  onBack,
}: {
  owner: string;
  tokenAddress: string;
  mint: string;
  holding?: PaymentTokenHolding;
  live?: boolean;
  onEnabled?: () => void;
  onBack?: () => void;
}) {
  const { address: walletAddress, matched, ownerShort } =
    useExpectedWallet(owner);
  const mutationOwner = matched ? walletAddress : null;
  const mintAddress = address(mint);
  const [amount, setAmount] = useState(DEFAULT_LIMIT_AMOUNT);
  const amountPrefilled = useRef(false);

  const statusQuery = useDelegateStatus(owner, tokenAddress, mintAddress, {
    live,
  });
  const mintQuery = useMintProgram(mintAddress);
  const status = statusQuery.data;
  const statusReady = statusQuery.data !== undefined;

  const token = holding ?? resolvePaymentToken(mint);
  const setAllowance = useSetDelegateMutation(mutationOwner, {
    mint: mintAddress,
    token: tokenAddress,
  });
  const revoke = useRevokeDelegateMutation(mutationOwner, {
    mint: mintAddress,
    token: tokenAddress,
  });

  const hasDelegate = isDelegateEnabled(status);
  const needsAta = needsAtaBeforeDelegate(status, statusReady);
  const busy =
    setAllowance.isPending ||
    revoke.isPending ||
    statusQuery.isLoading;
  const decimals = mintQuery.data?.decimals ?? token.decimals;

  useEffect(() => {
    if (!statusReady || amountPrefilled.current) return;
    amountPrefilled.current = true;
    if (hasDelegate && status?.delegatedAmountUi) {
      setAmount(status.delegatedAmountUi);
    }
  }, [statusReady, hasDelegate, status?.delegatedAmountUi]);

  let limitRaw: bigint | null;
  try {
    limitRaw = uiAmountToRaw(amount, decimals);
  } catch {
    limitRaw = null;
  }
  const saveDisabled =
    busy || !amount || limitRaw == null || !matched || needsAta;
  const cta = hasDelegate ? copy.pay.updateLimit : copy.pay.setLimit;
  const subtitle = hasDelegate
    ? copy.pay.spendingLimitSubtitleEdit
    : copy.pay.spendingLimitSubtitleNew;

  async function runEnable() {
    if (!walletAddress || walletAddress !== owner) return;
    if (!mintQuery.data) {
      toast.error(copy.pay.stillLoading);
      return;
    }
    if (limitRaw == null) {
      toast.error(copy.pay.enterValidAmount);
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
      toast.success(copy.pay.limitSaved);
      onEnabled?.();
    } catch (error) {
      toast.error(toUserErrorMessage(error, copy.pay.limitSaveFailed));
    }
  }

  async function runRemove() {
    if (!walletAddress || walletAddress !== owner) return;
    try {
      await revoke.mutateAsync();
      toast.success(copy.pay.limitRemoved);
      onEnabled?.();
    } catch (error) {
      toast.error(toUserErrorMessage(error, copy.pay.limitRemoveFailed));
    }
  }

  const backLink = onBack ? (
    <div className="flex items-center gap-2">
      <BackLink onClick={onBack} />
    </div>
  ) : null;

  if (!statusReady && statusQuery.isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        {backLink}
        <div className="flex flex-1 items-center justify-center py-10 text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin" />
        </div>
      </div>
    );
  }

  if (needsAta) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        {backLink}
        <GateMessage
          icon={<Coins className="size-5 text-muted-foreground" />}
          title={copy.pay.setupTokenAccountTitle(token.symbol)}
          body={copy.pay.setupTokenAccountBody(token.symbol)}
          action={
            <div className="flex w-full max-w-xs flex-col gap-2">
              {!matched ? (
                <ExpectedWalletConnect
                  owner={owner}
                  hint={copy.wallet.connectHint(ownerShort)}
                  disabled={busy}
                />
              ) : (
                <PayAtaSetup
                  owner={owner}
                  tokenAddress={tokenAddress}
                  mint={mintAddress}
                  token={token}
                />
              )}
              {onBack ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="w-full max-w-xs"
                  onClick={onBack}
                >
                  {copy.common.back}
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
      {backLink}

      <div className="space-y-1 text-center">
        <h1 className="font-(family-name:--font-display) text-2xl tracking-tight">
          {copy.pay.spendingLimitTitle}
        </h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <AmountField
        id="enable-limit"
        value={amount}
        onChange={setAmount}
        token={token}
        decimals={decimals}
        disabled={busy}
        autoFocus={matched}
        className="py-1"
      />

      <StickyActions>
        {!matched ? (
          <ExpectedWalletConnect
            owner={owner}
            hint={copy.wallet.connectToChangeLimit(ownerShort)}
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
                {copy.pay.confirmInWallet}
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
            {revoke.isPending ? copy.pay.removing : copy.pay.removeSpendingLimit}
          </Button>
        ) : null}
      </StickyActions>
    </div>
  );
}
