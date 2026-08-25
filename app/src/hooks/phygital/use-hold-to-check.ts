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
 * Confirmed when:
 * - signed NFC tap params verify (`useTapVerify`), or
 * - `startAuthentication` succeeds in this page (optional seed from parent
 *   after the same-tree cold hold), or
 * - Collection open seeds verified-owned only when Privy session matches
 *   `currentOwner` (URL `from=collection` alone is not trusted); never from
 *   sessionStorage.
 */
export function useHoldToCheck(
  token: PhygitalToken,
  /**
   * True when parent proved via WebAuthn/tap, or Collection seeds verified-owned.
   */
  webauthnProvenInTree = false,
) {
  const inApp = useIsInAppBrowser();
  const { authenticate, pending } = useAuthenticateAccessory();
  const { hasTapProof, verify } = useTapVerify();
  const tapConfirmed = hasTapProof && verify === "verified";

  const [holdConfirmed, setHoldConfirmed] = useState(false);
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
    // Include parent seed so Collection wallet-match / cold WebAuthn stick
    // when they arrive after the first render (Privy ready, etc.).
    liveConfirmed: holdConfirmed || tapConfirmed || webauthnProvenInTree,
    pending,
    holdError,
    showInAppGate,
    holdToCheck,
  };
}
