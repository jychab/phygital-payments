"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useIsRestoring } from "@tanstack/react-query";

import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { LoadingStatus } from "@/components/shared/loading-status";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { copy as productCopy } from "@/lib/copy/phygital";
import { useAuthenticateToken } from "@/hooks/token/use-authenticate-token";
import {
  usePhygitalToken,
} from "@/hooks/token/use-phygital-token";
import { useTapVerify } from "@/hooks/token/use-tap-verify";
import {
  initWebauthnSessionSnapshot,
  useWebauthnSession,
} from "@/hooks/token/use-webauthn-session";
import { useIsInAppBrowser } from "@/hooks/layout/use-is-in-app-browser";
import type { PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";

export type TokenNfcCopy = {
  inAppCheck: string;
  holdBody: string;
  sessionExpiredTitle: string;
  sessionExpiredBody: string;
  notSetUpTitle: string;
  notSetUpBody: string;
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
  useEffect(() => {
    initWebauthnSessionSnapshot();
  }, []);

  const { pk, hasTapProof, verify, verifyPending } = useTapVerify();
  const { session: webauthnSession, markVerified } = useWebauthnSession();

  const tapReady = hasTapProof && verify === "verified";
  const webauthnReady = Boolean(webauthnSession?.secp256r1PublicKey);
  const resolvedPk = pk ?? webauthnSession?.secp256r1PublicKey ?? null;

  if (hasTapProof && (verifyPending || verify === "pending")) {
    return <LoadingStatus label={productCopy.verifyingChip} />;
  }

  if ((tapReady || webauthnReady) && resolvedPk) {
    return (
      <VerifiedTokenFlow
        pk={resolvedPk}
        copy={copy}
        renderHome={renderHome}
        liveConfirmed
      />
    );
  }

  return (
    <HoldToCheckLanding
      copy={copy}
      sessionExpired={hasTapProof && verify === "failed"}
      onWebauthnVerified={markVerified}
    />
  );
}

function stripExpiredTapProofFromUrl(
  router: ReturnType<typeof useRouter>,
  searchParams: URLSearchParams,
  passkey: string,
): void {
  const next = new URLSearchParams(searchParams.toString());
  next.delete("s");
  next.delete("c");
  next.delete("n");
  next.set("pk", passkey);
  const qs = next.toString();
  router.replace(qs ? `/token?${qs}` : "/token", { scroll: false });
}

function HoldToCheckLanding({
  copy,
  sessionExpired,
  onWebauthnVerified,
}: {
  copy: TokenNfcCopy;
  sessionExpired: boolean;
  onWebauthnVerified: (secp256r1PublicKey: string) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inApp = useIsInAppBrowser();
  const { authenticate } = useAuthenticateToken();

  const [showInAppGate, setShowInAppGate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCheck() {
    if (inApp) {
      setShowInAppGate(true);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const { secp256r1PublicKey } = await authenticate();
      onWebauthnVerified(secp256r1PublicKey);
      stripExpiredTapProofFromUrl(router, searchParams, secp256r1PublicKey);
    } catch (err) {
      setError(
        toUserErrorMessage(err, productCopy.verifyFailedBody),
      );
    } finally {
      setBusy(false);
    }
  }

  if (showInAppGate) {
    return <InAppBrowserGate body={copy.inAppCheck} />;
  }

  if (busy) {
    return (
      <NfcHoldStatus
        size="lg"
        busy
        title={productCopy.holdStill}
        body={productCopy.holdStillBody}
      />
    );
  }

  if (error) {
    return (
      <NfcHoldStatus
        size="lg"
        title={productCopy.verifyFailed}
        body={error || productCopy.verifyFailedBody}
        onRingClick={() => void onCheck()}
        ringAriaLabel={productCopy.holdToCheck}
        action={
          <p className="text-center text-xs text-muted-foreground">
            {productCopy.verifyFailedRetry}
          </p>
        }
      />
    );
  }

  const landingTitle = sessionExpired
    ? copy.sessionExpiredTitle
    : productCopy.holdToCheck;
  const landingBody = sessionExpired
    ? copy.sessionExpiredBody
    : copy.holdBody;

  return (
    <NfcHoldStatus
      size="lg"
      title={landingTitle}
      body={landingBody}
      onRingClick={() => void onCheck()}
      ringAriaLabel={productCopy.holdToCheck}
    />
  );
}

function VerifiedTokenFlow({
  pk,
  copy,
  renderHome,
  liveConfirmed,
}: {
  pk: string;
  copy: TokenNfcCopy;
  renderHome: (args: {
    token: PhygitalToken;
    liveConfirmed?: boolean;
  }) => ReactNode;
  liveConfirmed: boolean;
}) {
  const isRestoring = useIsRestoring();
  const tokenQuery = usePhygitalToken(pk);

  if (tokenQuery.data) {
    return renderHome({ token: tokenQuery.data, liveConfirmed });
  }

  if (
    isRestoring ||
    tokenQuery.isPending ||
    tokenQuery.isLoading ||
    tokenQuery.isFetching
  ) {
    return <LoadingStatus label={productCopy.verifyingChip} />;
  }

  return (
    <NfcHoldStatus
      size="lg"
      pulsing={false}
      title={copy.notSetUpTitle}
      body={copy.notSetUpBody}
    />
  );
}
