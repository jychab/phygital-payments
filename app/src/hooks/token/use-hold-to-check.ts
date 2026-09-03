"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuthenticateToken } from "@/hooks/token/use-authenticate-token";
import { useTapVerify } from "@/hooks/token/use-tap-verify";
import { useIsInAppBrowser } from "@/hooks/layout/use-is-in-app-browser";
import { copy } from "@/lib/copy/phygital";
import type { PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";

const RECHECK_SUCCESS_MS = 2800;

export type HoldToCheckOverlay =
  | null
  | "pending"
  | "recheck-success"
  | "failed";

/**
 * Hold-to-Check + Confirmed badge.
 *
 * Confirmed when signed NFC tap params verify, or `startAuthentication`
 * succeeds in this page (optional seed from parent after cold hold).
 */
export function useHoldToCheck(
  token: PhygitalToken,
  /** True when parent already proved via WebAuthn/tap in this tree. */
  webauthnProvenInTree = false,
) {
  const inApp = useIsInAppBrowser();
  const { authenticate } = useAuthenticateToken();
  const { hasTapProof, verify } = useTapVerify();
  const tapConfirmed = hasTapProof && verify === "verified";

  const [holdConfirmed, setHoldConfirmed] = useState(false);
  const [overlay, setOverlay] = useState<HoldToCheckOverlay>(null);
  const [showInAppGate, setShowInAppGate] = useState(false);
  const [holdError, setHoldError] = useState<string | null>(null);
  const [failedRecheck, setFailedRecheck] = useState(false);
  const recheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRecheckRef = useRef(false);

  useEffect(() => {
    return () => {
      if (recheckTimer.current) clearTimeout(recheckTimer.current);
    };
  }, []);

  const liveConfirmed = holdConfirmed || tapConfirmed || webauthnProvenInTree;

  async function holdToCheck() {
    if (inApp) {
      setShowInAppGate(true);
      return;
    }

    isRecheckRef.current = liveConfirmed;
    setHoldError(null);
    setOverlay("pending");

    try {
      await authenticate({
        expectedPublicKey: token.secp256r1PublicKey,
      });
      setHoldConfirmed(true);
      setFailedRecheck(false);

      if (isRecheckRef.current) {
        setOverlay("recheck-success");
        toast.success(copy.verify.verified, {
          description: copy.verify.verifiedAgainBody,
        });
        if (recheckTimer.current) clearTimeout(recheckTimer.current);
        recheckTimer.current = setTimeout(() => {
          setOverlay(null);
        }, RECHECK_SUCCESS_MS);
      } else {
        setOverlay(null);
      }
    } catch (err) {
      setHoldError(
        toUserErrorMessage(err, copy.verify.failedBody),
      );
      setFailedRecheck(isRecheckRef.current);
      setOverlay("failed");
    }
  }

  return {
    liveConfirmed,
    overlay,
    failedRecheck,
    pending: overlay === "pending",
    recheckSuccess: overlay === "recheck-success",
    holdError,
    showInAppGate,
    holdToCheck,
  };
}
