"use client";

import { useState } from "react";
import { useIsRestoring, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Nfc } from "lucide-react";
import type { Address } from "@solana/kit";

import { CenteredStatus, GateMessage } from "@/components/layout/gate-message";
import { ApiKeyPanel } from "@/components/pay/api-key-panel";
import { HoldToPayPanel } from "@/components/pay/hold-to-pay-panel";
import { ManagePayPanel } from "@/components/pay/manage-pay-panel";
import { SpendingLimitPanel } from "@/components/pay/spending-limit-panel";
import { BackLink } from "@/components/shared/back-link";
import { DeviceIdentity } from "@/components/shared/device-identity";
import { Button } from "@/components/ui/button";
import { useDelegateStatus } from "@/hooks/pay/use-delegate-status";
import { useOwnerPayDelegates } from "@/hooks/pay/use-owner-pay-delegates";
import { useVerifiedApiKey } from "@/hooks/pay/use-verified-api-key";
import { invalidateOwnerQueries } from "@/lib/queries";
import type { PhygitalToken } from "@/lib/phygital/token";
import {
  isDelegateEnabled,
  isOwnerPayMintEnabled,
  type OwnerPayMintMatch,
} from "@/lib/tokens/mint-delegate";
import {
  getDefaultMint,
  type PaymentTokenHolding,
} from "@/lib/tokens/payment-token";
import { toUserErrorMessage } from "@/lib/user-errors";

type PayNav =
  | { screen: "manage" }
  | { screen: "need-device" }
  | { screen: "pick-limit"; holding: PaymentTokenHolding }
  | { screen: "limit"; holding: PaymentTokenHolding; tokenAddress: string }
  | { screen: "first-limit"; tokenAddress: string };

export type PayScreenProps = {
  owner: string;
  /** When set (owned device), spending limit is bound to this NFC token PDA. */
  tokenAddress?: string;
  onExit?: () => void;
  /** When false, owner queries fetch once without background polling. */
  active?: boolean;
};

/**
 * Shared Pay surface for Home (`/`) and owned Device.
 * Setup order: API key → spending limit → Hold to Pay.
 */
export function PayScreen({
  owner,
  tokenAddress: deviceTokenAddress,
  onExit,
  active = true,
}: PayScreenProps) {
  const queryClient = useQueryClient();
  const isRestoring = useIsRestoring();
  const queryOpts = { live: active };
  const delegates = useOwnerPayDelegates(owner, queryOpts);
  const keyQuery = useVerifiedApiKey(owner);
  const defaultMint = getDefaultMint();
  const pinnedDelegate = useDelegateStatus(
    deviceTokenAddress ? owner : null,
    deviceTokenAddress ?? null,
    defaultMint,
    queryOpts,
  );

  const [nav, setNav] = useState<PayNav | null>(null);

  const tokens = delegates.data?.tokens ?? [];
  const defaultMintKey = String(defaultMint);
  const defaultWalletMatch = delegates.data?.byMint.get(defaultMintKey);
  const pinnedWalletMatch: OwnerPayMintMatch | undefined =
    deviceTokenAddress && pinnedDelegate.data
      ? { token: deviceTokenAddress as Address, status: pinnedDelegate.data }
      : undefined;
  const limitReady = deviceTokenAddress
    ? isDelegateEnabled(pinnedDelegate.data)
    : delegates.data?.tokenEnabled === true;
  const limitLoading = deviceTokenAddress
    ? pinnedDelegate.isLoading
    : delegates.isPending;

  function onLimitEnabled() {
    invalidateOwnerQueries(queryClient, owner);
    setNav(null);
  }

  function openLimit(holding: PaymentTokenHolding) {
    if (delegates.isPending) return;
    const match = delegates.data?.byMint.get(holding.mint);
    const existingToken = match?.token;
    if (existingToken && isOwnerPayMintEnabled(match)) {
      setNav({ screen: "limit", holding, tokenAddress: String(existingToken) });
      return;
    }
    if (deviceTokenAddress) {
      setNav({ screen: "limit", holding, tokenAddress: deviceTokenAddress });
      return;
    }
    if (tokens.length === 0) {
      setNav({ screen: "need-device" });
      return;
    }
    if (tokens.length === 1) {
      setNav({
        screen: "limit",
        holding,
        tokenAddress: String(tokens[0]!.address),
      });
      return;
    }
    setNav({ screen: "pick-limit", holding });
  }

  const loading = isRestoring || keyQuery.isPending || limitLoading;

  const loadError =
    keyQuery.error ??
    (deviceTokenAddress ? pinnedDelegate.error : null) ??
    delegates.error;

  if (loading) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </CenteredStatus>
    );
  }

  if (loadError) {
    return (
      <GateMessage
        icon={<Nfc className="size-5 text-destructive" />}
        title="Couldn’t load Pay"
        body={toUserErrorMessage(
          loadError,
          "Check your connection and try again.",
        )}
        destructive
        action={
          onExit ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={onExit}
            >
              Back
            </Button>
          ) : undefined
        }
      />
    );
  }

  if (nav?.screen === "need-device") {
    return <NeedDeviceGate onBack={() => setNav(null)} />;
  }

  if (nav?.screen === "pick-limit") {
    return (
      <PayDevicePicker
        tokens={tokens}
        onSelect={(tokenAddress) => {
          setNav({
            screen: "limit",
            holding: nav.holding,
            tokenAddress,
          });
        }}
        onBack={() => setNav(null)}
      />
    );
  }

  if (nav?.screen === "limit") {
    return (
      <SpendingLimitPanel
        owner={owner}
        tokenAddress={nav.tokenAddress}
        mint={nav.holding.mint}
        holding={nav.holding}
        walletMatch={delegates.data?.byMint.get(nav.holding.mint)}
        live={active}
        onEnabled={onLimitEnabled}
        onBack={() => setNav(null)}
      />
    );
  }

  if (nav?.screen === "manage") {
    return (
      <ManagePayPanel
        owner={owner}
        live={active}
        onBack={() => setNav(null)}
        onEditTokenLimit={openLimit}
      />
    );
  }

  if (nav?.screen === "first-limit") {
    return (
      <SpendingLimitPanel
        owner={owner}
        tokenAddress={nav.tokenAddress}
        mint={defaultMintKey}
        walletMatch={pinnedWalletMatch ?? defaultWalletMatch}
        live={active}
        onEnabled={onLimitEnabled}
        onBack={onExit}
        onSkip={onExit}
      />
    );
  }

  if (keyQuery.data !== true) {
    return <ApiKeyPanel owner={owner} onBack={onExit} onSkip={onExit} />;
  }

  if (!limitReady) {
    if (deviceTokenAddress) {
      return (
        <SpendingLimitPanel
          owner={owner}
          tokenAddress={deviceTokenAddress}
          mint={defaultMintKey}
          walletMatch={pinnedWalletMatch ?? defaultWalletMatch}
          live={active}
          onEnabled={onLimitEnabled}
          onBack={onExit}
          onSkip={onExit}
        />
      );
    }

    if (tokens.length === 0) {
      return <NeedDeviceGate onBack={onExit ?? (() => setNav(null))} />;
    }

    if (tokens.length > 1) {
      return (
        <PayDevicePicker
          tokens={tokens}
          onSelect={(tokenAddress) =>
            setNav({ screen: "first-limit", tokenAddress })
          }
          onBack={onExit}
        />
      );
    }

    return (
      <SpendingLimitPanel
        owner={owner}
        tokenAddress={String(tokens[0]!.address)}
        mint={defaultMintKey}
        walletMatch={defaultWalletMatch}
        live={active}
        onEnabled={onLimitEnabled}
        onBack={onExit}
        onSkip={onExit}
      />
    );
  }

  return (
    <HoldToPayPanel
      owner={owner}
      onManage={() => setNav({ screen: "manage" })}
      onBack={onExit}
    />
  );
}

function NeedDeviceGate({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col gap-5">
      <GateMessage
        icon={<Nfc className="size-5 text-muted-foreground" />}
        title="Add a device first"
        body="Hold a device to the back of your phone to add it to this wallet."
        action={
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={onBack}
          >
            Back
          </Button>
        }
      />
    </div>
  );
}

function PayDevicePicker({
  tokens,
  onSelect,
  onBack,
}: {
  tokens: readonly PhygitalToken[];
  onSelect: (tokenAddress: string) => void;
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
          This limit is for one device. Only that device can pay with this
          token.
        </p>
      </div>
      <ul className="flex flex-col gap-1">
        {tokens.map((item) => (
          <li key={item.address}>
            <button
              type="button"
              onClick={() => onSelect(String(item.address))}
              className="flex w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
            >
              <DeviceIdentity token={item} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
