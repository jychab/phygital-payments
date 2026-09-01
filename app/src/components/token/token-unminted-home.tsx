"use client";

import { address } from "@solana/kit";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { TokenUnmintedPanel } from "@/components/token/token-unminted-panel";
import { WalletSyncGate } from "@/components/shared/wallet-sync-gate";
import { BackToCollection } from "@/components/shared/back-to-collection";
import { LoadingStatus } from "@/components/shared/loading-status";
import {
  TokenClaimSessionGate,
  useTokenClaimSession,
} from "@/hooks/token/use-token-claim-session";
import { useHoldToPay } from "@/hooks/pay/use-hold-to-pay";
import { useOwnerPayDelegates } from "@/hooks/pay/use-owner-pay-delegates";
import { usePreauthRequired } from "@/hooks/pay/use-preauth-required";
import { useTokenPayOpen } from "@/hooks/token/use-token-pay-open";
import { invalidateOwnerQueries } from "@/lib/queries";
import { collectHref } from "@/lib/collect/payment-request";
import type { AccessoryPrimaryKind } from "@/lib/pay/accessory-pay-state";
import {
  tokenAllowsPay,
  isUnclaimedToken,
  type PhygitalToken,
} from "@/lib/phygital/token";
import { copy } from "@/lib/copy/phygital";
import type { PaymentTokenHolding } from "@/lib/tokens/payment-token";

const ManagePayPanelLazy = dynamic(
  () =>
    import("@/components/pay/manage-pay-panel").then((m) => m.ManagePayPanel),
  { ssr: false, loading: () => <LoadingStatus label={copy.pay.loadingLabel} /> },
);

const HoldToPayPhaseView = dynamic(
  () =>
    import("@/components/pay/hold-to-pay-panel").then(
      (m) => m.HoldToPayPhaseView,
    ),
  { ssr: false, loading: () => <LoadingStatus label={copy.pay.loadingLabel} /> },
);

const SpendingLimitPanel = dynamic(
  () =>
    import("@/components/pay/spending-limit-panel").then(
      (m) => m.SpendingLimitPanel,
    ),
  { ssr: false, loading: () => <LoadingStatus label={copy.pay.loadingLabel} /> },
);

const ApiKeyPanel = dynamic(
  () => import("@/components/pay/api-key-panel").then((m) => m.ApiKeyPanel),
  { ssr: false, loading: () => <LoadingStatus label={copy.pay.loadingLabel} /> },
);

type AccessoryNav =
  | { screen: "home" }
  | { screen: "limit"; holding: PaymentTokenHolding }
  | { screen: "authorize" };

/**
 * Unminted accessory home — linked wallet identity, holdings, limits, Pay.
 */
export function TokenUnmintedHome({
  token: tokenProp,
  liveConfirmed: liveConfirmedProp = false,
  fromCollection = false,
}: {
  token: PhygitalToken;
  liveConfirmed?: boolean;
  fromCollection?: boolean;
}) {
  const session = useTokenClaimSession(tokenProp, liveConfirmedProp);
  const queryClient = useQueryClient();
  const [{ open: showPaySettings }, setShowPaySettings] = useTokenPayOpen();
  const [nav, setNav] = useState<AccessoryNav>({ screen: "home" });

  const owner = String(session.token.currentOwner);
  const tokenAddress = String(session.token.address);
  const canPay = session.token.isLocked && tokenAllowsPay(session.token);
  const linked = !isUnclaimedToken(session.token);

  const delegatesQuery = useOwnerPayDelegates(linked ? owner : null, {
    live: linked,
  });
  const preauth = usePreauthRequired(linked ? owner : null);
  const preConfirmationOn = preauth.data?.required === true;
  const keyReady = preauth.data?.keyOk === true;

  const receiveHref =
    linked && !fromCollection
      ? collectHref({ recipient: owner })
      : undefined;

  function onLimitEnabled() {
    invalidateOwnerQueries(queryClient, owner);
    setNav({ screen: "home" });
  }

  function onPrimaryAction(kind: AccessoryPrimaryKind) {
    switch (kind) {
      case "claim":
        session.openClaim();
        break;
      case "verify":
        void session.holdToCheck();
        break;
      case "authorize":
        setNav({ screen: "authorize" });
        break;
      case "pay":
        void hold.onPay();
        break;
      default:
        break;
    }
  }

  const hold = useHoldToPay(owner);

  if (showPaySettings) {
    return (
      <WalletSyncGate linkedOwner={owner}>
        <ManagePayPanelLazy
          owner={owner}
          onBack={() => setShowPaySettings(false)}
        />
      </WalletSyncGate>
    );
  }

  if (nav.screen === "limit") {
    const match = delegatesQuery.data?.byMint.get(nav.holding.mint);
    return (
      <WalletSyncGate linkedOwner={owner}>
        <SpendingLimitPanel
          owner={owner}
          tokenAddress={tokenAddress}
          mint={nav.holding.mint}
          holding={nav.holding}
          walletMatch={
            match?.token && String(match.token) === tokenAddress
              ? match
              : { token: address(tokenAddress), status: match?.status ?? null }
          }
          live
          onEnabled={onLimitEnabled}
          onBack={() => setNav({ screen: "home" })}
        />
      </WalletSyncGate>
    );
  }

  if (nav.screen === "authorize") {
    return (
      <WalletSyncGate linkedOwner={owner}>
        <ApiKeyPanel
          owner={owner}
          onStored={() => setNav({ screen: "home" })}
          onBack={() => setNav({ screen: "home" })}
        />
      </WalletSyncGate>
    );
  }

  return (
    <TokenClaimSessionGate
      session={session}
      noun="accessory"
      inAppBody={copy.gate.openInBrowserBody}
    >
      {hold.showPhase && canPay ? (
        <TokenHoldPhase
          owner={owner}
          fromCollection={fromCollection}
          phase={hold.phase}
          paid={hold.paid}
          secondsLeft={hold.secondsLeft}
          onCancelWindow={() => void hold.onCancelWindow()}
          onReset={hold.resetToIdle}
        />
      ) : (
        <div className="flex flex-1 flex-col">
          {fromCollection ? <BackToCollection /> : null}
          <TokenUnmintedPanel
            token={session.token}
            liveConfirmed={session.liveConfirmed}
            fromCollection={fromCollection}
            holdError={session.holdError}
            onHoldToCheck={() => void session.holdToCheck()}
            onClaim={session.openClaim}
            owner={owner}
            tokenAddress={tokenAddress}
            holdings={delegatesQuery.holdings}
            delegates={delegatesQuery.data}
            payLoading={
              linked &&
              (delegatesQuery.isLoading || preauth.isPending)
            }
            preConfirmationOn={preConfirmationOn}
            keyReady={keyReady}
            payBusy={hold.busy}
            onEditLimit={(holding) =>
              setNav({ screen: "limit", holding })
            }
            onOpenSettings={
              canPay
                ? () =>
                    setShowPaySettings({
                      tokenAddress,
                    })
                : undefined
            }
            receiveHref={receiveHref}
            onPrimaryAction={onPrimaryAction}
          />
        </div>
      )}
    </TokenClaimSessionGate>
  );
}

function TokenHoldPhase({
  owner,
  fromCollection,
  phase,
  paid,
  secondsLeft,
  onCancelWindow,
  onReset,
}: {
  owner: string;
  fromCollection: boolean;
  phase: ReturnType<typeof useHoldToPay>["phase"];
  paid: ReturnType<typeof useHoldToPay>["paid"];
  secondsLeft: number;
  onCancelWindow: () => void;
  onReset: () => void;
}) {
  const delegates = useOwnerPayDelegates(owner, { live: false });

  return (
    <div className="flex flex-1 flex-col">
      {fromCollection && phase !== "window" ? <BackToCollection /> : null}
      <HoldToPayPhaseView
        phase={phase}
        paid={paid}
        secondsLeft={secondsLeft}
        holdings={delegates.holdings}
        onCancelWindow={onCancelWindow}
        onReset={onReset}
      />
    </div>
  );
}
