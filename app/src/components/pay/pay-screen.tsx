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
import { AccessoryIdentity } from "@/components/shared/accessory-identity";
import { Button } from "@/components/ui/button";
import { useDelegateStatus } from "@/hooks/pay/use-delegate-status";
import { useOwnerPayDelegates } from "@/hooks/pay/use-owner-pay-delegates";
import { usePreauthRequired } from "@/hooks/pay/use-preauth-required";
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
  | { screen: "setup-key" }
  | { screen: "need-accessory" }
  | { screen: "pick-limit"; holding: PaymentTokenHolding }
  | { screen: "limit"; holding: PaymentTokenHolding; tokenAddress: string }
  | { screen: "first-limit"; tokenAddress: string };

export type PayScreenProps = {
  owner: string;
  /** When set (owned accessory), spending limit is bound to this NFC token PDA. */
  tokenAddress?: string;
  onExit?: () => void;
  /** When false, owner queries fetch once without background polling. */
  active?: boolean;
  /**
   * Accessory Hold path: API-key only, no wallet panels.
   * Escalate via `onNeedManage` if limit/key setup or Settings is needed.
   */
  intent?: "hold";
  onNeedManage?: () => void;
};

/**
 * Shared Pay surface for Home (`/`) and an owned accessory.
 * Setup order: spending limit → Pay home. Confirm Payments off lands on
 * Pay Settings; on lands on Hold to Pay.
 */
export function PayScreen({
  owner,
  tokenAddress,
  onExit,
  active = true,
  intent,
  onNeedManage,
}: PayScreenProps) {
  const queryClient = useQueryClient();
  const isRestoring = useIsRestoring();
  const queryOpts = { live: active };
  const delegates = useOwnerPayDelegates(owner, queryOpts);
  const requiredQuery = usePreauthRequired(owner);
  const confirmationRequired = requiredQuery.data?.required === true;
  const keyReady = requiredQuery.data?.keyOk === true;
  const defaultMint = getDefaultMint();
  const pinnedDelegate = useDelegateStatus(
    tokenAddress ? owner : null,
    tokenAddress ?? null,
    defaultMint,
    queryOpts,
  );

  const [nav, setNav] = useState<PayNav | null>(null);

  const manageIsHome = !confirmationRequired;
  const tokens = delegates.data?.tokens ?? [];
  const defaultMintKey = String(defaultMint);
  const defaultHolding = delegates.holdings?.find(
    (holding) => holding.mint === defaultMintKey,
  );
  const defaultWalletMatch = delegates.data?.byMint.get(defaultMintKey);
  const pinnedWalletMatch: OwnerPayMintMatch | undefined =
    tokenAddress && pinnedDelegate.data
      ? { token: tokenAddress as Address, status: pinnedDelegate.data }
      : undefined;
  const limitReady = tokenAddress
    ? isDelegateEnabled(pinnedDelegate.data)
    : delegates.data?.tokenEnabled === true;
  const limitLoading = tokenAddress
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
    if (tokenAddress) {
      setNav({ screen: "limit", holding, tokenAddress });
      return;
    }
    if (tokens.length === 0) {
      setNav({ screen: "need-accessory" });
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

  const loading = isRestoring || requiredQuery.isPending || limitLoading;

  const loadError =
    requiredQuery.error ??
    (tokenAddress ? pinnedDelegate.error : null) ??
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

  // Hold intent: arm payment without mounting wallet-gated setup panels.
  if (intent === "hold") {
    if (confirmationRequired && keyReady && limitReady) {
      return (
        <HoldToPayPanel
          owner={owner}
          confirmationRequired={confirmationRequired}
          keyReady={keyReady}
          holdings={delegates.holdings}
          onSetupPhone={onNeedManage}
          onManage={onNeedManage}
          onBack={onExit}
        />
      );
    }

    return (
      <GateMessage
        icon={<Nfc className="size-5 text-muted-foreground" />}
        title="Finish Pay setup"
        body="Connect the linked wallet to set a spending limit or provision this phone."
        action={
          <div className="flex w-full flex-col gap-2">
            {onNeedManage ? (
              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={onNeedManage}
              >
                Continue
              </Button>
            ) : null}
            {onExit ? (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={onExit}
              >
                Back
              </Button>
            ) : null}
          </div>
        }
      />
    );
  }

  if (nav?.screen === "need-accessory") {
    return <NeedAccessoryGate onBack={() => setNav(null)} />;
  }

  if (nav?.screen === "pick-limit") {
    return (
      <PayAccessoryPicker
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

  if (nav?.screen === "manage" || (manageIsHome && nav == null && limitReady)) {
    return (
      <ManagePayPanel
        owner={owner}
        live={active}
        onBack={
          manageIsHome && nav == null ? onExit : () => setNav(null)
        }
        onEditTokenLimit={openLimit}
      />
    );
  }

  if (nav?.screen === "setup-key") {
    return (
      <ApiKeyPanel
        owner={owner}
        onStored={() => setNav(null)}
        onBack={() => setNav(null)}
      />
    );
  }

  if (nav?.screen === "first-limit") {
    return (
      <SpendingLimitPanel
        owner={owner}
        tokenAddress={nav.tokenAddress}
        mint={defaultMintKey}
        holding={defaultHolding}
        walletMatch={pinnedWalletMatch ?? defaultWalletMatch}
        live={active}
        onEnabled={onLimitEnabled}
        onBack={onExit}
        onSkip={onExit}
      />
    );
  }

  if (!limitReady) {
    if (tokenAddress) {
      return (
        <SpendingLimitPanel
          owner={owner}
          tokenAddress={tokenAddress}
          mint={defaultMintKey}
          holding={defaultHolding}
          walletMatch={pinnedWalletMatch ?? defaultWalletMatch}
          live={active}
          onEnabled={onLimitEnabled}
          onBack={onExit}
          onSkip={onExit}
        />
      );
    }

    if (tokens.length === 0) {
      return <NeedAccessoryGate onBack={onExit ?? (() => setNav(null))} />;
    }

    if (tokens.length > 1) {
      return (
        <PayAccessoryPicker
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
        holding={defaultHolding}
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
      confirmationRequired={confirmationRequired}
      keyReady={keyReady}
      holdings={delegates.holdings}
      onSetupPhone={() => setNav({ screen: "setup-key" })}
      onManage={() => setNav({ screen: "manage" })}
      onBack={onExit}
    />
  );
}

function NeedAccessoryGate({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col gap-5">
      <GateMessage
        icon={<Nfc className="size-5 text-muted-foreground" />}
        title="Add an accessory first"
        body="Hold an accessory to the back of your phone to add it to this wallet."
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

function PayAccessoryPicker({
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
          Choose an Accessory
        </h1>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          This limit is for one accessory. Only that accessory can pay with this
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
              <AccessoryIdentity token={item} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
