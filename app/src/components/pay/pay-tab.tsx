"use client";

import { useState } from "react";
import { useIsRestoring, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Nfc } from "lucide-react";

import { CenteredStatus, GateMessage } from "@/components/layout/gate-message";
import { ApiKeyPanel } from "@/components/pay/api-key-panel";
import {
  LimitPanel,
  PayDevicePicker,
} from "@/components/pay/pay-limit-panel";
import { ManagePayPanel } from "@/components/pay/pay-panel";
import { PayFlowPanel } from "@/components/pay/pay-flow-panel";
import { Button } from "@/components/ui/button";
import { WalletSyncGate } from "@/components/shared/wallet-sync-gate";
import { useDelegateStatus } from "@/hooks/pay/use-delegate-status";
import { useOwnerPayDelegates } from "@/hooks/pay/use-owner-pay-delegates";
import { useVerifiedApiKey } from "@/hooks/pay/use-verified-api-key";
import { usePayTokenContext } from "@/hooks/tokens/use-verified-tokens";
import { invalidateOwnerQueries } from "@/lib/queries";
import {
  isDelegateEnabled,
  isOwnerPayMintEnabled,
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
  | { screen: "setup"; asset: string };

/**
 * Shared Pay surface for Home and Device.
 * Setup order: API key → spending limit (this tag on Device) → Hold to Pay.
 */
export function PayTab(props: {
  owner: string;
  pinnedAsset?: string;
  onExit?: () => void;
  /** When false, owner queries fetch once without background polling. */
  active?: boolean;
}) {
  return (
    <WalletSyncGate linkedOwner={props.owner}>
      <PayTabContent {...props} />
    </WalletSyncGate>
  );
}

function PayTabContent({
  owner,
  pinnedAsset,
  onExit,
  active = true,
}: {
  owner: string;
  pinnedAsset?: string;
  onExit?: () => void;
  active?: boolean;
}) {
  const queryClient = useQueryClient();
  const isRestoring = useIsRestoring();
  const queryOpts = { live: active };
  const payContext = usePayTokenContext(owner, queryOpts);
  const delegates = useOwnerPayDelegates(owner, queryOpts);
  const keyQuery = useVerifiedApiKey(owner);
  const defaultMint = getDefaultMint();
  const pinnedDelegate = useDelegateStatus(
    pinnedAsset ? owner : null,
    pinnedAsset ?? null,
    defaultMint,
    queryOpts,
  );

  const [nav, setNav] = useState<PayNav | null>(null);

  const assets = delegates.data?.assets ?? [];
  const defaultMintKey = String(defaultMint);
  const defaultWalletMatch = delegates.data?.byMint.get(defaultMintKey);
  const limitReady = pinnedAsset
    ? isDelegateEnabled(pinnedDelegate.data)
    : delegates.data?.tokenEnabled === true;
  const limitLoading = pinnedAsset
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
    if (pinnedAsset) {
      setNav({ screen: "limit", holding, asset: pinnedAsset });
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
        asset: String(assets[0]!.asset),
      });
      return;
    }
    setNav({ screen: "pick-limit", holding });
  }

  const loading =
    isRestoring ||
    keyQuery.isPending ||
    limitLoading ||
    (payContext.isLoading && !pinnedAsset);

  const loadError =
    keyQuery.error ??
    (pinnedAsset ? pinnedDelegate.error : null) ??
    delegates.error ??
    payContext.error;

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
      <LimitPanel
        expectedOwner={owner}
        asset={nav.asset}
        mint={nav.holding.mint}
        walletMatch={delegates.data?.byMint.get(nav.holding.mint)}
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

  if (nav?.screen === "setup") {
    return (
      <LimitPanel
        expectedOwner={owner}
        asset={nav.asset}
        mint={defaultMint}
        walletMatch={defaultWalletMatch}
        onEnabled={onLimitEnabled}
        onBack={onExit}
        onSkip={onExit}
      />
    );
  }

  if (keyQuery.data !== true) {
    return (
      <ApiKeyPanel
        expectedOwner={owner}
        onBack={onExit}
        onSkip={onExit}
      />
    );
  }

  if (!limitReady) {
    if (pinnedAsset) {
      return (
        <LimitPanel
          expectedOwner={owner}
          asset={pinnedAsset}
          mint={defaultMint}
          walletMatch={defaultWalletMatch}
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
          onSelect={(asset) => setNav({ screen: "setup", asset })}
          onBack={onExit}
        />
      );
    }

    return (
      <LimitPanel
        expectedOwner={owner}
        asset={String(assets[0]!.asset)}
        mint={defaultMint}
        walletMatch={defaultWalletMatch}
        onEnabled={onLimitEnabled}
        onBack={onExit}
        onSkip={onExit}
      />
    );
  }

  return (
    <PayFlowPanel
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
        body="Hold a device to this phone to add it, then set a spending limit."
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
