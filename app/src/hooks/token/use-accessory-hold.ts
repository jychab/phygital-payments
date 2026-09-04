"use client";

import { useState } from "react";

import { useAuthenticateToken } from "@/hooks/token/use-authenticate-token";
import { useIsInAppBrowser } from "@/hooks/layout/use-is-in-app-browser";
import { copy } from "@/lib/copy/phygital";
import { toUserErrorMessage } from "@/lib/user-errors";

/**
 * Shared Hold gate: in-app browser check + accessory WebAuthn + busy/error.
 * Used by cold `/token` Hold and address Hold-before-wallet.
 */
export function useAccessoryHold() {
  const inApp = useIsInAppBrowser();
  const { authenticate, pending } = useAuthenticateToken();
  const [showInAppGate, setShowInAppGate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function hold(args?: { expectedPublicKey?: string }) {
    if (inApp) {
      setShowInAppGate(true);
      return null;
    }
    setError(null);
    try {
      return await authenticate(args);
    } catch (e) {
      setError(toUserErrorMessage(e, copy.verify.failedBody));
      return null;
    }
  }

  return {
    showInAppGate,
    holding: pending,
    error,
    setError,
    hold,
  };
}
