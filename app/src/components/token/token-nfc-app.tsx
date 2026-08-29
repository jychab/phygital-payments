"use client";

import { useState, type ReactNode } from "react";
import { useIsRestoring } from "@tanstack/react-query";

import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { LoadingStatus } from "@/components/shared/loading-status";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { copy as productCopy } from "@/lib/copy/phygital";
import { useAuthenticateToken } from "@/hooks/token/use-authenticate-token";
import {
  usePhygitalToken,
  usePhygitalTokenByPasskey,
} from "@/hooks/token/use-phygital-token";
import { useTapVerify } from "@/hooks/token/use-tap-verify";
import { useIsInAppBrowser } from "@/hooks/layout/use-is-in-app-browser";
import type { PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";

export type TokenNfcCopy = {
  inAppCheck: string;
  holdBody: string;
  notSetUp: string;
};

export function TokenNfcApp({
  copy,
  renderHome,
}: {
  copy: TokenNfcCopy;
  renderHome: (args: {
    token: PhygitalToken;
    /** True only after WebAuthn or tap-verify in this tree. */
    liveConfirmed?: boolean;
  }) => ReactNode;
}) {
  const { pk, hasTapProof, verify, verifyPending } = useTapVerify();

  if (hasTapProof && (verifyPending || verify === "pending")) {
    return <LoadingStatus label={productCopy.verifyingChip} />;
  }

  // Missing, incomplete, invalid, or failed tap → Hold to Check (cold entry).
  if (!hasTapProof || verify !== "verified") {
    return <HoldToCheckLanding copy={copy} renderHome={renderHome} />;
  }

  return <TapTokenFlow pk={pk} copy={copy} renderHome={renderHome} />;
}

function HoldToCheckLanding({
  copy,
  renderHome,
}: {
  copy: TokenNfcCopy;
  renderHome: (args: {
    token: PhygitalToken;
    liveConfirmed?: boolean;
  }) => ReactNode;
}) {
  const inApp = useIsInAppBrowser();
  const { authenticate } = useAuthenticateToken();

  const [showInAppGate, setShowInAppGate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [passkey, setPasskey] = useState<string | null>(null);
  const [webauthnProven, setWebauthnProven] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenQuery = usePhygitalTokenByPasskey(passkey);

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

  if (error) {
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
  copy,
  renderHome,
}: {
  pk: string | null;
  copy: TokenNfcCopy;
  renderHome: (args: {
    token: PhygitalToken;
    liveConfirmed?: boolean;
  }) => ReactNode;
}) {
  const isRestoring = useIsRestoring();
  const tokenQuery = usePhygitalToken(pk);

  if (
    isRestoring ||
    tokenQuery.isLoading ||
    !tokenQuery.isFetchedAfterMount
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
