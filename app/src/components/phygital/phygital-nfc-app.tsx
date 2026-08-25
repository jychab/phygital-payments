"use client";

import { useRef, useState, type ReactNode } from "react";
import { useIsRestoring } from "@tanstack/react-query";

import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { LoadingStatus } from "@/components/shared/loading-status";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { copy as productCopy } from "@/lib/copy/phygital";
import { useAuthenticateAccessory } from "@/hooks/accessory/use-authenticate-accessory";
import {
  usePhygitalToken,
  usePhygitalTokenByPasskey,
} from "@/hooks/accessory/use-phygital-token";
import { useTapVerify } from "@/hooks/accessory/use-tap-verify";
import { useIsInAppBrowser } from "@/hooks/layout/use-is-in-app-browser";
import { useEnsurePhygitalSurface } from "@/hooks/phygital/use-ensure-phygital-surface";
import { takeDiscovery } from "@/lib/phygital/discovery-handoff";
import type { PhygitalSurface } from "@/lib/phygital/surface";
import type { PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";

export type PhygitalNfcCopy = {
  inAppCheck: string;
  holdBody: string;
  notSetUp: string;
};

export function PhygitalNfcApp({
  surface,
  copy,
  renderHome,
}: {
  surface: PhygitalSurface;
  copy: PhygitalNfcCopy;
  renderHome: (args: {
    token: PhygitalToken;
    /** True only after WebAuthn or tap-verify in this tree. */
    liveConfirmed?: boolean;
  }) => ReactNode;
}) {
  const { pk, hasTapProof, verify, verifyPending } = useTapVerify();

  if (!hasTapProof) {
    return (
      <HoldToCheckLanding
        surface={surface}
        copy={copy}
        renderHome={renderHome}
      />
    );
  }

  if (verifyPending || verify === "pending") {
    return <LoadingStatus label={productCopy.verifyingChip} />;
  }

  if (verify !== "verified") {
    return (
      <HoldToCheckLanding
        surface={surface}
        copy={copy}
        failed
        renderHome={renderHome}
      />
    );
  }

  return (
    <TapTokenFlow
      pk={pk}
      surface={surface}
      copy={copy}
      renderHome={renderHome}
    />
  );
}

function HoldToCheckLanding({
  surface,
  copy,
  failed = false,
  renderHome,
}: {
  surface: PhygitalSurface;
  copy: PhygitalNfcCopy;
  failed?: boolean;
  renderHome: (args: {
    token: PhygitalToken;
    liveConfirmed?: boolean;
  }) => ReactNode;
}) {
  const inApp = useIsInAppBrowser();
  const { authenticate } = useAuthenticateAccessory();
  const handoffRef = useRef(takeDiscovery(surface));
  const handoff = handoffRef.current;

  const [showInAppGate, setShowInAppGate] = useState(false);
  const [busy, setBusy] = useState(false);
  /** Passkey from WebAuthn this session, or surface-redirect handoff (load only). */
  const [passkey, setPasskey] = useState<string | null>(
    handoff?.passkey ?? null,
  );
  /** Confirmed only after WebAuthn here — never from handoff. */
  const [webauthnProven, setWebauthnProven] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenQuery = usePhygitalTokenByPasskey(passkey);
  const mismatch = useEnsurePhygitalSurface(tokenQuery.data, surface);

  async function onCheck() {
    if (inApp) {
      setShowInAppGate(true);
      return;
    }
    setError(null);
    setPasskey(null);
    setWebauthnProven(false);
    setBusy(true);
    try {
      const { secp256r1PublicKey } = await authenticate();
      setPasskey(secp256r1PublicKey);
      setWebauthnProven(true);
    } catch (err) {
      setError(
        toUserErrorMessage(
          err,
          "Hold it flat against the back of your phone and try again.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  if (showInAppGate) {
    return <InAppBrowserGate body={copy.inAppCheck} />;
  }

  if (mismatch) {
    return <LoadingStatus label={productCopy.verifyingChip} />;
  }

  if (tokenQuery.isFetchedAfterMount && tokenQuery.data) {
    return renderHome({
      token: tokenQuery.data,
      liveConfirmed: webauthnProven,
    });
  }

  const checking =
    busy ||
    (Boolean(passkey) &&
      (tokenQuery.isPending ||
        tokenQuery.isFetching ||
        !tokenQuery.isFetchedAfterMount));
  if (checking) {
    return (
      <NfcHoldStatus
        size="lg"
        busy
        title={productCopy.holdStill}
        body={productCopy.holdStillBody}
      />
    );
  }

  if (passkey && tokenQuery.isError) {
    return (
      <NfcHoldStatus
        size="lg"
        title="Couldn’t Verify"
        body="Hold it flat against the back of your phone and try again."
        onRingClick={() => void onCheck()}
        ringAriaLabel={productCopy.holdToCheck}
      />
    );
  }

  if (passkey && tokenQuery.isFetchedAfterMount && tokenQuery.data === null) {
    return (
      <NfcHoldStatus
        size="lg"
        pulsing={false}
        title="Not Set Up"
        body={copy.notSetUp}
        onRingClick={() => void onCheck()}
        ringAriaLabel={productCopy.holdToCheck}
      />
    );
  }

  if (error || failed) {
    return (
      <NfcHoldStatus
        size="lg"
        title="Couldn’t Verify"
        body="Hold it flat against the back of your phone and try again."
        onRingClick={() => void onCheck()}
        ringAriaLabel={productCopy.holdToCheck}
      />
    );
  }

  return (
    <NfcHoldStatus
      size="lg"
      title={productCopy.holdToCheck}
      body={copy.holdBody}
      onRingClick={() => void onCheck()}
      ringAriaLabel={productCopy.holdToCheck}
    />
  );
}

function TapTokenFlow({
  pk,
  surface,
  copy,
  renderHome,
}: {
  pk: string | null;
  surface: PhygitalSurface;
  copy: PhygitalNfcCopy;
  renderHome: (args: {
    token: PhygitalToken;
    liveConfirmed?: boolean;
  }) => ReactNode;
}) {
  const isRestoring = useIsRestoring();
  const tokenQuery = usePhygitalToken(pk);
  const mismatch = useEnsurePhygitalSurface(tokenQuery.data, surface);

  if (
    isRestoring ||
    tokenQuery.isLoading ||
    !tokenQuery.isFetchedAfterMount ||
    mismatch
  ) {
    return <LoadingStatus label={productCopy.verifyingChip} />;
  }

  if (tokenQuery.isError || !tokenQuery.data) {
    return (
      <NfcHoldStatus
        size="lg"
        pulsing={false}
        title="Not Set Up"
        body={copy.notSetUp}
      />
    );
  }

  // Tap params already verified by /api/verify-tap — Confirmed is earned.
  return renderHome({ token: tokenQuery.data, liveConfirmed: true });
}
