"use client";

import { useState } from "react";
import { useIsRestoring } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, LoaderCircle, Nfc } from "lucide-react";
import { address, type Address } from "@solana/kit";

import { AmountField } from "@/components/shared/amount-field";
import { BackLink } from "@/components/shared/back-link";
import { QueryRefreshButton } from "@/components/shared/query-refresh-button";
import { TokenListRow, TokenSymbol } from "@/components/shared/token-chip";
import { Button } from "@/components/ui/button";
import {
  useDelegateStatus,
} from "@/hooks/pay/use-delegate-status";
import { useMintProgram } from "@/hooks/tokens/use-mint-program";
import {
  useSetDelegateMutation,
  useRevokeDelegateMutation,
} from "@/hooks/pay/use-delegate-mutations";
import {
  usePayTokenContext,
  useTokenHoldings,
  useVerifiedTokens,
} from "@/hooks/tokens/use-verified-tokens";
import { isDelegateEnabled, isOwnerPayMintEnabled, uiAmountToRaw, type OwnerPayMintMatch } from "@/lib/tokens/mint-delegate";
import type { PhygitalAsset } from "@/lib/phygital/asset";
import { useOwnerPayDelegates } from "@/hooks/pay/use-owner-pay-delegates";
import {
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
 * Pick a spending limit for a mint (this device's program-authority delegate).
 */
export function LimitPanel({
  expectedOwner,
  asset,
  mint: mintProp,
  walletMatch,
  onEnabled,
  onBack,
  onSkip,
}: {
  expectedOwner: string;
  asset: Address | string;
  mint: Address | string;
  /** Home Pay already scanned this mint — skip a second delegateStatus RPC. */
  walletMatch?: OwnerPayMintMatch;
  onEnabled?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
}) {
  const { address: walletAddress, isConnected } = useSolanaAddress();
  const mint = String(mintProp);
  const mintAddress = address(mint);
  const assetStr = String(asset);
  const [amount, setAmount] = useState("50");

  const seeded =
    walletMatch?.status &&
    walletMatch.asset &&
    String(walletMatch.asset) === assetStr
      ? walletMatch.status
      : undefined;
  const statusQuery = useDelegateStatus(
    seeded ? null : expectedOwner,
    seeded ? null : assetStr,
    mintAddress,
  );
  const mintQuery = useMintProgram(mintAddress);
  const holdings = useTokenHoldings(expectedOwner);
  const verified = useVerifiedTokens();
  const status = seeded ?? statusQuery.data;

  const holding = holdings.data?.find(
    (h: PaymentTokenHolding) => h.mint === mint,
  );
  const token = holding ?? resolvePaymentToken(mint, verified.data);
  const setAllowance = useSetDelegateMutation(
    walletAddress === expectedOwner ? walletAddress : null,
    { mint: mintAddress, asset: assetStr },
  );
  const revoke = useRevokeDelegateMutation(
    walletAddress === expectedOwner ? walletAddress : null,
    { mint: mintAddress, asset: assetStr },
  );

  const hasDelegate = isDelegateEnabled(status);
  const wrongWallet =
    isConnected && walletAddress != null && walletAddress !== expectedOwner;
  const matched = isConnected && walletAddress === expectedOwner;
  const busy =
    setAllowance.isPending ||
    revoke.isPending ||
    (!seeded && statusQuery.isLoading);
  const decimals = mintQuery.data?.decimals ?? token.decimals;

  const limitRaw = tryUiAmountToRaw(amount, decimals);

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

  const saveDisabled = busy || !amount || limitRaw == null || !matched;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center gap-2">
        {onBack ? <BackLink onClick={onBack} /> : null}
        <QueryRefreshButton owner={expectedOwner} className="ml-auto" />
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
  const delegates = useOwnerPayDelegates(owner);

  if (isRestoring || payContext.isLoading || delegates.isLoading) {
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

  const assetsByAddress = new Map(
    (delegates.data?.assets ?? []).map((a) => [String(a.asset), a]),
  );

  return (
    <ul className="flex flex-col gap-0.5">
      {list.map((h: PaymentTokenHolding) => {
        const match = delegates.data?.byMint.get(h.mint);
        const asset = match?.asset;
        return (
          <ManagePayTokenRow
            key={h.mint}
            holding={h}
            match={match}
            device={asset ? assetsByAddress.get(String(asset)) : undefined}
            onEditLimit={onEditLimit}
          />
        );
      })}
    </ul>
  );
}

function ManagePayTokenRow({
  holding,
  match,
  device,
  onEditLimit,
}: {
  holding: PaymentTokenHolding;
  match: OwnerPayMintMatch | undefined;
  device: PhygitalAsset | undefined;
  onEditLimit: (holding: PaymentTokenHolding) => void;
}) {
  const enabled = isOwnerPayMintEnabled(match);
  const usdc = isDefaultMint(holding.mint);
  const deviceLabel = device
    ? shortAddress(device.secp256r1PublicKey, 4)
    : null;
  const limitLabel = usdc
    ? `Limit $${match?.status?.delegatedAmountUi ?? "—"}`
    : `Limit ${match?.status?.delegatedAmountUi ?? "—"}`;
  const subtitle = enabled
    ? deviceLabel
      ? `${limitLabel} · ${deviceLabel} · ${holding.balanceUi} available`
      : `${limitLabel} · ${holding.balanceUi} available`
    : `Off · ${holding.balanceUi} available`;

  return (
    <li>
      <TokenListRow
        token={holding}
        subtitle={subtitle}
        onSelect={() => onEditLimit(holding)}
        trailing={
          <span className="text-[11px] font-medium text-primary">
            {enabled ? "Edit" : "Turn On"}
          </span>
        }
      />
    </li>
  );
}

/** Choose which NFC device a new mint spending limit applies to. */
export function PayDevicePicker({
  assets,
  onSelect,
  onBack,
}: {
  assets: readonly PhygitalAsset[];
  onSelect: (asset: string) => void;
  onBack?: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      {onBack ? (
        <div className="flex items-center gap-2">
          <BackLink onClick={onBack} />
        </div>
      ) : null}
      <div className="space-y-1.5 text-center">
        <h1 className="font-(family-name:--font-display) text-2xl tracking-tight">
          Choose a Device
        </h1>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          This spending limit applies to one NFC device. Only that device can
          pay with this token.
        </p>
      </div>
      <ul className="flex flex-col gap-1">
        {assets.map((asset) => (
          <li key={asset.asset}>
            <button
              type="button"
              onClick={() => onSelect(String(asset.asset))}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card/60">
                <Nfc className="size-4 text-muted-foreground" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {shortAddress(asset.secp256r1PublicKey, 6)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {asset.isLocked ? "Locked" : "Unlocked"}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
