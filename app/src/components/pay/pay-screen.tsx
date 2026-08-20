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
import type { PhygitalAsset } from "@/lib/phygital/asset";
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
  | { screen: "limit"; holding: PaymentTokenHolding; asset: string }
  | { screen: "first-limit"; asset: string };

export type PayScreenProps = {
  owner: string;
  /** When set (owned device), spending limit is bound to this NFC asset PDA. */
  asset?: string;
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
  asset: deviceAsset,
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
    deviceAsset ? owner : null,
    deviceAsset ?? null,
    defaultMint,
    queryOpts,
  );

  const [nav, setNav] = useState<PayNav | null>(null);

  const assets = delegates.data?.assets ?? [];
  const defaultMintKey = String(defaultMint);
  const defaultWalletMatch = delegates.data?.byMint.get(defaultMintKey);
  const pinnedWalletMatch: OwnerPayMintMatch | undefined =
    deviceAsset && pinnedDelegate.data
      ? { asset: deviceAsset as Address, status: pinnedDelegate.data }
      : undefined;
  const limitReady = deviceAsset
    ? isDelegateEnabled(pinnedDelegate.data)
    : delegates.data?.tokenEnabled === true;
  const limitLoading = deviceAsset
    ? pinnedDelegate.isLoading
    : delegates.isPending;

  function onLimitEnabled() {
    invalidateOwnerQueries(queryClient, owner);
    setNav(null);
  }

  function openLimit(holding: PaymentTokenHolding) {
    if (delegates.isPending) return;
    const match = delegates.data?.byMint.get(holding.mint);
    const existingAsset = match?.asset;
    if (existingAsset && isOwnerPayMintEnabled(match)) {
      setNav({ screen: "limit", holding, asset: String(existingAsset) });
      return;
    }
    if (deviceAsset) {
      setNav({ screen: "limit", holding, asset: deviceAsset });
      return;
    }
    if (assets.length === 0) {
      setNav({ screen: "need-device" });
      return;
    }
    if (assets.length === 1) {
      setNav({
        screen: "limit",
        holding,
        asset: String(assets[0]!.address),
      });
      return;
    }
    setNav({ screen: "pick-limit", holding });
  }

  const loading = isRestoring || keyQuery.isPending || limitLoading;

  const loadError =
    keyQuery.error ??
    (deviceAsset ? pinnedDelegate.error : null) ??
    delegates.error;

  if (loading) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading Pay…</p>
      </CenteredStatus>
    );
  }

  if (loadError) {
    return (
      <GateMessage
        icon={<Nfc className="size-5 text-destructive" />}
        title="Couldn't load Pay"
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
        assets={assets}
        onSelect={(asset) => {
          setNav({
            screen: "limit",
            holding: nav.holding,
            asset,
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
        asset={nav.asset}
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
        asset={nav.asset}
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
    if (deviceAsset) {
      return (
        <SpendingLimitPanel
          owner={owner}
          asset={deviceAsset}
          mint={defaultMintKey}
          walletMatch={pinnedWalletMatch ?? defaultWalletMatch}
          live={active}
          onEnabled={onLimitEnabled}
          onBack={onExit}
          onSkip={onExit}
        />
      );
    }

    if (assets.length === 0) {
      return <NeedDeviceGate onBack={onExit ?? (() => setNav(null))} />;
    }

    if (assets.length > 1) {
      return (
        <PayDevicePicker
          assets={assets}
          onSelect={(asset) => setNav({ screen: "first-limit", asset })}
          onBack={onExit}
        />
      );
    }

    return (
      <SpendingLimitPanel
        owner={owner}
        asset={String(assets[0]!.address)}
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
        title="Add an NFC device"
        body="Hold a device, then claim it to this wallet, then set a spending limit."
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
        {assets.map((item) => (
          <li key={item.address}>
            <button
              type="button"
              onClick={() => onSelect(String(item.address))}
              className="flex w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
            >
              <DeviceIdentity asset={item} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
