"use client";

import { useState } from "react";

import { useAuthenticateAccessory } from "@/hooks/accessory/use-authenticate-accessory";
import { useIsInAppBrowser } from "@/hooks/layout/use-is-in-app-browser";
import type { PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";

/** Shared Hold-to-Check flow for card and accessory homes. */
export function useHoldToCheck(
  token: PhygitalToken,
  initialLiveConfirmed = false,
) {
  const inApp = useIsInAppBrowser();
  const { authenticate, pending } = useAuthenticateAccessory();
  const [liveConfirmed, setLiveConfirmed] = useState(initialLiveConfirmed);
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
      setLiveConfirmed(true);
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
    liveConfirmed,
    pending,
    holdError,
    showInAppGate,
    holdToCheck,
  };
}
