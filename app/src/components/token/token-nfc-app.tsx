"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { findPhygitalTokenPda } from "phygital-token-sdk";

import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { Button } from "@/components/ui/button";
import { useAccessoryHold } from "@/hooks/token/use-accessory-hold";
import { useTapVerify } from "@/hooks/token/use-tap-verify";
import { copy } from "@/lib/copy/phygital";
import { toUserErrorMessage } from "@/lib/user-errors";
import { storeAccessoryProof, storePossessionToken } from "@/lib/wallet/device-auth-client";
import { tokenHomeHref } from "@/lib/wallet/token-home-href";

export type TokenNfcCopy = {
  inAppCheck: string;
  holdBody: string;
};

/**
 * Cold `/token` — NFC tap or Hold, then address-gated home.
 */
export function TokenNfcApp({ nfcCopy }: { nfcCopy: TokenNfcCopy }) {
  const router = useRouter();
  const { hasTapProof, verify, verifyPending, result, verifyError } =
    useTapVerify();
  const accessory = useAccessoryHold();
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasTapProof || verify !== "verified" || !result?.secp256r1PublicKey) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const pda = String(
          await findPhygitalTokenPda(result.secp256r1PublicKey!),
        );
        if (result.possessionToken) {
          storePossessionToken(pda, result.possessionToken);
        }
        if (!cancelled) router.replace(tokenHomeHref(pda));
      } catch (e) {
        if (!cancelled) setRouteError(toUserErrorMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasTapProof, verify, result, router]);

  async function holdToOpen() {
    setRouteError(null);
    const auth = await accessory.hold();
    if (!auth) return;
    try {
      const pda = String(await findPhygitalTokenPda(auth.secp256r1PublicKey));
      // Reuse this Hold for browse + link (same role as NFC possessionToken).
      storeAccessoryProof(pda, {
        message: auth.message,
        response: auth.response,
      });
      router.replace(tokenHomeHref(pda));
    } catch (e) {
      setRouteError(toUserErrorMessage(e));
    }
  }

  if (accessory.showInAppGate) {
    return <InAppBrowserGate body={nfcCopy.inAppCheck} />;
  }

  if (
    hasTapProof &&
    (verifyPending || verify === "pending" || verify === "verified") &&
    !routeError
  ) {
    return (
      <NfcHoldStatus
        size="lg"
        pulsing
        busy
        title={copy.verify.verifyingChip}
      />
    );
  }

  if (accessory.holding) {
    return (
      <NfcHoldStatus
        size="lg"
        pulsing
        busy
        title={copy.verify.holdStill}
        body={copy.verify.holdStillBody}
      />
    );
  }

  const error =
    accessory.error ??
    routeError ??
    (hasTapProof && verify === "failed"
      ? toUserErrorMessage(verifyError)
      : null);

  return (
    <NfcHoldStatus
      size="lg"
      pulsing={!error}
      title={error ? copy.verify.failed : copy.verify.holdToCheck}
      body={error ?? nfcCopy.holdBody}
      action={
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => void holdToOpen()}
        >
          {error ? copy.common.tryAgain : copy.verify.holdToCheck}
        </Button>
      }
    />
  );
}
