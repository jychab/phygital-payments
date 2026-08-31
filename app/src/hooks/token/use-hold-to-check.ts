"use client";

import { useEffect, useRef, useState } from "react";

import { useAuthenticateToken } from "@/hooks/token/use-authenticate-token";
import { useTapVerify } from "@/hooks/token/use-tap-verify";
import { useIsInAppBrowser } from "@/hooks/layout/use-is-in-app-browser";
import type { PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";

const RECHECK_SUCCESS_MS = 2000;

/**
 * Hold-to-Check + Confirmed badge.
 *
 * Confirmed when:
 * - signed NFC tap params verify (`useTapVerify`), or
 * - `startAuthentication` succeeds in this page (optional seed from parent
 *   after the same-tree cold hold), or
 * - Collection open seeds verified-owned only when wallet session matches
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
  const { authenticate } = useAuthenticateToken();
  const { hasTapProof, verify } = useTapVerify();
  const tapConfirmed = hasTapProof && verify === "verified";

  const [holdConfirmed, setHoldConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [recheckSuccess, setRecheckSuccess] = useState(false);
  const [showInAppGate, setShowInAppGate] = useState(false);
  const [holdError, setHoldError] = useState<string | null>(null);
  const recheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (recheckTimer.current) clearTimeout(recheckTimer.current);
    };
  }, []);

  async function holdToCheck() {
    if (inApp) {
      setShowInAppGate(true);
      return;
    }
    const wasAlreadyConfirmed =
      holdConfirmed || tapConfirmed || webauthnProvenInTree;
    setHoldError(null);
    setRecheckSuccess(false);
    setPending(true);
    try {
      await authenticate({ expectedPublicKey: token.secp256r1PublicKey });
      // Set confirmed before clearing pending so the gate never flashes the
      // Verify landing between authenticate()'s finally and this update.
      setHoldConfirmed(true);
      if (wasAlreadyConfirmed) {
        setRecheckSuccess(true);
        if (recheckTimer.current) clearTimeout(recheckTimer.current);
        recheckTimer.current = setTimeout(() => {
          setRecheckSuccess(false);
        }, RECHECK_SUCCESS_MS);
      }
    } catch (err) {
      setHoldError(
        toUserErrorMessage(
          err,
          "Hold it flat against the back of your phone and try again.",
        ),
      );
    } finally {
      setPending(false);
    }
  }

  return {
    // Include parent seed so Collection wallet-match / cold WebAuthn stick
    // when they arrive after the first render (wallet ready, etc.).
    liveConfirmed: holdConfirmed || tapConfirmed || webauthnProvenInTree,
    pending,
    recheckSuccess,
    holdError,
    showInAppGate,
    holdToCheck,
  };
}
