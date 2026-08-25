"use client";

import { useState } from "react";

import { useAuthenticateAccessory } from "@/hooks/accessory/use-authenticate-accessory";
import { useTapVerify } from "@/hooks/accessory/use-tap-verify";
import { useIsInAppBrowser } from "@/hooks/layout/use-is-in-app-browser";
import type { PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";

/**
 * Hold-to-Check + Confirmed badge.
 *
 * Confirmed only when:
 * - signed NFC tap params verify (`useTapVerify`), or
 * - `startAuthentication` succeeds in this page (optional seed from parent
 *   after the same-tree cold hold — never from sessionStorage).
 */
export function useHoldToCheck(
  token: PhygitalToken,
  /** True only if this tree just completed WebAuthn (e.g. cold Hold landing). */
  webauthnProvenInTree = false,
) {
  const inApp = useIsInAppBrowser();
  const { authenticate, pending } = useAuthenticateAccessory();
  const { hasTapProof, verify } = useTapVerify();
  const tapConfirmed = hasTapProof && verify === "verified";

  const [holdConfirmed, setHoldConfirmed] = useState(webauthnProvenInTree);
  const [showInAppGate, setShowInAppGate] = useState(false);
  const [holdError, setHoldError] = useState<string | null>(null);

  async function holdToCheck() {
    if (inApp) {
      setShowInAppGate(true);
      return;
    }
    setHoldError(null);
    try {
      await authenticate({ expectedPublicKey: token.secp256r1PublicKey });
      setHoldConfirmed(true);
    } catch (err) {
      setHoldError(
        toUserErrorMessage(
          err,
          "Hold it flat against the back of your phone and try again.",
        ),
      );
    }
  }

  return {
    liveConfirmed: holdConfirmed || tapConfirmed,
    pending,
    holdError,
    showInAppGate,
    holdToCheck,
  };
}
