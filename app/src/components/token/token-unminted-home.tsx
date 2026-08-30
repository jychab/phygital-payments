"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { type ReactNode } from "react";

import { TokenUnmintedPanel } from "@/components/token/token-unminted-panel";
import {
  HoldToPayHint,
  HoldToPayIdleActions,
} from "@/components/pay/hold-to-pay-actions";
import { WalletSyncGate } from "@/components/shared/wallet-sync-gate";
import { BackToCollection } from "@/components/shared/back-to-collection";
import { LoadingStatus } from "@/components/shared/loading-status";
import { Button } from "@/components/ui/button";
import {
  useTokenPayOpen,
  type TokenPayMode,
} from "@/hooks/token/use-token-pay-open";
import {
  TokenClaimSessionGate,
  useTokenClaimSession,
} from "@/hooks/token/use-token-claim-session";
import { useHoldToPay } from "@/hooks/pay/use-hold-to-pay";
import { useOwnerPayDelegates } from "@/hooks/pay/use-owner-pay-delegates";
import { usePreauthRequired } from "@/hooks/pay/use-preauth-required";
import { collectHref } from "@/lib/collect/payment-request";
import {
  tokenAllowsPay,
  isUnclaimedToken,
  type PhygitalToken,
} from "@/lib/phygital/token";
import { copy, payCopy } from "@/lib/copy/phygital";

const PastePayKeyPanel = dynamic(
  () =>
    import("@/components/pay/paste-pay-key-panel").then(
      (m) => m.PastePayKeyPanel,
    ),
  { ssr: false, loading: () => <LoadingStatus label={payCopy.loading} /> },
);

const PayScreen = dynamic(
  () => import("@/components/pay/pay-screen").then((m) => m.PayScreen),
  { ssr: false, loading: () => <LoadingStatus label={payCopy.loading} /> },
);

const HoldToPayPhaseView = dynamic(
  () =>
    import("@/components/pay/hold-to-pay-panel").then(
      (m) => m.HoldToPayPhaseView,
    ),
  { ssr: false, loading: () => <LoadingStatus label={payCopy.loading} /> },
);

/**
 * Unminted-token home after a check, claim, or Collection open.
 *
 * WebAuthn-first: authenticity hosts Hold-to-Pay CTAs (arm Pay in place).
 * Heavy Pay bootstrap / Manage / setup chunks load only when needed.
 * Collection (`fromCollection`) shows Back; Confirmed only when session
 * matches the linked owner (see CollectionVerifiedSeed).
 */
export function TokenUnmintedHome({
  token: tokenProp,
  liveConfirmed: liveConfirmedProp = false,
  fromCollection = false,
}: {
  token: PhygitalToken;
  /**
   * True when parent proved via WebAuthn/tap, or CollectionVerifiedSeed
   * confirmed the connected wallet owns this token. Never from URL alone.
   */
  liveConfirmed?: boolean;
  /** Opened from Collection hub (`from=collection`) — Back link only. */
  fromCollection?: boolean;
}) {
  const session = useTokenClaimSession(tokenProp, liveConfirmedProp);
  const [{ open: showPay, mode: payMode }, setShowPay] = useTokenPayOpen();

  const owner = String(session.token.currentOwner);
  const canPay = session.token.isLocked && tokenAllowsPay(session.token);
  /**
   * Merchant Collect launcher — only for cold NFC / deep-link opens.
   * Collection hub already has a connected wallet; Collect needs standalone WebAuthn.
   */
  const collectLaunch =
    !fromCollection && !isUnclaimedToken(session.token) ? (
      <CollectLaunchLink recipient={owner} />
    ) : undefined;

  function openPay(mode: TokenPayMode) {
    setShowPay({
      tokenAddress: String(session.token.address),
      mode,
    });
  }

  if (showPay && payMode === "setup") {
    return (
      <PastePayKeyPanel
        owner={owner}
        onBack={() => setShowPay(false)}
        onStored={() => setShowPay(false)}
        onNeedWallet={() => openPay("manage")}
      />
    );
  }

  if (showPay && payMode === "manage") {
    return (
      <TokenManagePayEntry
        owner={owner}
        tokenAddress={String(session.token.address)}
        onExit={() => setShowPay(false)}
      />
    );
  }

  return (
    <TokenClaimSessionGate
      session={session}
      noun="accessory"
      inAppBody={copy.openInBrowser}
    >
      {canPay ? (
        <TokenPayHome
          token={session.token}
          owner={owner}
          liveConfirmed={session.liveConfirmed}
          fromCollection={fromCollection}
          holdError={session.holdError}
          collectAction={collectLaunch}
          onHoldToCheck={() => void session.holdToCheck()}
          onClaim={session.openClaim}
          onOpenSetup={() => openPay("setup")}
          onOpenManage={() => openPay("manage")}
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
            collectAction={collectLaunch}
          />
        </div>
      )}
    </TokenClaimSessionGate>
  );
}

/** Opens Collect as this wallet — friends pay with their accessories. */
function CollectLaunchLink({ recipient }: { recipient: string }) {
  return (
    <Button asChild variant="outline" size="lg" className="w-full">
      <Link href={collectHref({ recipient })}>{copy.collect}</Link>
    </Button>
  );
}

/**
 * Authenticity + real Hold-to-Pay CTAs (arm Pay in place).
 * Pay bootstrap RPC only after a payment window starts (success amount).
 */
function TokenPayHome({
  token,
  owner,
  liveConfirmed,
  fromCollection,
  holdError,
  collectAction,
  onHoldToCheck,
  onClaim,
  onOpenSetup,
  onOpenManage,
}: {
  token: PhygitalToken;
  owner: string;
  liveConfirmed: boolean;
  fromCollection: boolean;
  holdError?: string | null;
  collectAction?: ReactNode;
  onHoldToCheck: () => void;
  onClaim: () => void;
  onOpenSetup: () => void;
  onOpenManage: () => void;
}) {
  const hold = useHoldToPay(owner);

  if (hold.showPhase) {
    return (
      <TokenHoldPhase
        owner={owner}
        fromCollection={fromCollection}
        phase={hold.phase}
        paid={hold.paid}
        secondsLeft={hold.secondsLeft}
        onCancelWindow={() => void hold.onCancelWindow()}
        onReset={hold.resetToIdle}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {fromCollection ? <BackToCollection /> : null}
      <TokenUnmintedPanel
        token={token}
        liveConfirmed={liveConfirmed}
        fromCollection={fromCollection}
        holdError={holdError}
        onHoldToCheck={onHoldToCheck}
        onClaim={onClaim}
        collectAction={collectAction}
        payAction={
          <TokenIntegratedPayCta
            owner={owner}
            busy={hold.busy}
            onPay={() => void hold.onPay()}
            onOpenSetup={onOpenSetup}
            onOpenManage={onOpenManage}
          />
        }
      />
    </div>
  );
}

/** Mounts holdings fetch only while a payment phase is active. */
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
  const delegates = useOwnerPayDelegates(owner, {
    // Window phase does not need holdings; success does. One-shot is enough.
    live: false,
  });

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

/**
 * Confirm / key matrix with real actions — Pay arms preauth; Set up / Manage
 * open full screens. Manage mounts wallet connect when needed.
 */
function TokenIntegratedPayCta({
  owner,
  busy,
  onPay,
  onOpenSetup,
  onOpenManage,
}: {
  owner: string;
  busy: boolean;
  onPay: () => void;
  onOpenSetup: () => void;
  onOpenManage: () => void;
}) {
  const preauth = usePreauthRequired(owner);
  const required = preauth.data?.required === true;
  const keyOk = preauth.data?.keyOk === true;

  if (preauth.isPending) {
    return (
      <Button type="button" size="lg" className="w-full" disabled>
        …
      </Button>
    );
  }

  if (required) {
    return (
      <div className="flex w-full flex-col gap-2.5">
        <p className="text-center text-sm text-muted-foreground">
          <HoldToPayHint confirmationRequired={required} keyReady={keyOk} />
        </p>
        <HoldToPayIdleActions
          confirmationRequired={required}
          keyReady={keyOk}
          busy={busy}
          onPay={onPay}
          onSetupPhone={onOpenSetup}
          onManage={onOpenManage}
        />
      </div>
    );
  }

  // Confirm-off — open Manage; connect is required there if no wallet yet.
  return (
    <Button type="button" size="lg" className="w-full" onClick={onOpenManage}>
      {payCopy.manage}
    </Button>
  );
}

/** Manage Pay — view without Connect; WalletSync only if wrong wallet linked. */
function TokenManagePayEntry({
  owner,
  tokenAddress,
  onExit,
}: {
  owner: string;
  tokenAddress: string;
  onExit: () => void;
}) {
  return (
    <WalletSyncGate linkedOwner={owner}>
      <PayScreen
        intent="manage"
        owner={owner}
        tokenAddress={tokenAddress}
        onExit={onExit}
      />
    </WalletSyncGate>
  );
}
