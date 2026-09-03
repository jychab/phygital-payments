"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { LoadingStatus } from "@/components/shared/loading-status";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/phygital";
import { useTapVerify } from "@/hooks/token/use-tap-verify";
import { useIsInAppBrowser } from "@/hooks/layout/use-is-in-app-browser";
import { queryKeys } from "@/lib/queries";
import { toUserErrorMessage } from "@/lib/user-errors";
import {
  mintTokenSessionViaHold,
  tokenHomeHref,
} from "@/lib/wallet/token-session";

export type TokenNfcCopy = {
  inAppCheck: string;
  holdBody: string;
  sessionExpiredTitle: string;
  sessionExpiredBody: string;
  notSetUpTitle: string;
  notSetUpBody: string;
};

/**
 * Cold `/token` — Hold or signed NFC tap, then enter the session-gated home.
 */
export function TokenNfcApp({ nfcCopy }: { nfcCopy: TokenNfcCopy }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasTapProof, verify, verifyPending, result } = useTapVerify();
  const tapAddress = result?.phygitalToken?.trim() ?? "";

  useEffect(() => {
    if (!hasTapProof || verify !== "verified" || !tapAddress) return;
    if (
      result?.secp256r1PublicKey &&
      typeof result.expiresAt === "number"
    ) {
      queryClient.setQueryData(queryKeys.tokenSession.byToken(tapAddress), {
        phygitalToken: tapAddress,
        secp256r1PublicKey: result.secp256r1PublicKey,
        expiresAt: result.expiresAt,
      });
    }
    router.replace(tokenHomeHref(tapAddress));
  }, [
    hasTapProof,
    verify,
    tapAddress,
    result?.secp256r1PublicKey,
    result?.expiresAt,
    queryClient,
    router,
  ]);

  if (hasTapProof && (verifyPending || verify === "pending")) {
    return (
      <NfcHoldStatus
        size="lg"
        pulsing
        busy
        title={copy.verify.verifyingChip}
        body={undefined}
      />
    );
  }

  if (hasTapProof && verify === "verified") {
    if (!tapAddress) {
      return (
        <NfcHoldStatus
          size="lg"
          pulsing={false}
          title={nfcCopy.notSetUpTitle}
          body={nfcCopy.notSetUpBody}
        />
      );
    }
    return <LoadingStatus label={copy.verify.verifyingChip} />;
  }

  return (
    <HoldToCheckLanding
      nfcCopy={nfcCopy}
      sessionExpired={hasTapProof && verify === "failed"}
    />
  );
}

function HoldToCheckLanding({
  nfcCopy,
  sessionExpired,
}: {
  nfcCopy: TokenNfcCopy;
  sessionExpired: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const inApp = useIsInAppBrowser();

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
      const session = await mintTokenSessionViaHold();
      queryClient.setQueryData(
        queryKeys.tokenSession.byToken(session.phygitalToken),
        session,
      );
      router.replace(tokenHomeHref(session.phygitalToken));
    } catch (err) {
      setError(toUserErrorMessage(err, copy.verify.failedBody));
    } finally {
      setBusy(false);
    }
  }

  if (showInAppGate) {
    return <InAppBrowserGate body={nfcCopy.inAppCheck} />;
  }

  if (busy) {
    return (
      <NfcHoldStatus
        size="lg"
        busy
        title={copy.verify.holdStill}
        body={copy.verify.holdStillBody}
      />
    );
  }

  if (error) {
    return (
      <NfcHoldStatus
        size="lg"
        pulsing={false}
        title={copy.verify.failed}
        body={error || copy.verify.failedBody}
        action={
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => void onCheck()}
          >
            {copy.common.tryAgain}
          </Button>
        }
      />
    );
  }

  const landingTitle = sessionExpired
    ? nfcCopy.sessionExpiredTitle
    : copy.verify.holdToCheck;
  const landingBody = sessionExpired
    ? nfcCopy.sessionExpiredBody
    : nfcCopy.holdBody;

  return (
    <NfcHoldStatus
      size="lg"
      title={landingTitle}
      body={landingBody}
      action={
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => void onCheck()}
        >
          {copy.verify.holdToCheck}
        </Button>
      }
    />
  );
}
