"use client";

import { useCallback, useState } from "react";

import { authenticateDevice } from "@/lib/device/authenticate";
import { toUserErrorMessage } from "@/lib/user-errors";

/**
 * Hold to Check — live WebAuthn against a client-issued challenge.
 */
export function useAuthenticateDevice() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = useCallback(
    async (args?: { expectedPublicKey?: string }) => {
      setError(null);
      setPending(true);
      try {
        const result = await authenticateDevice({
          expectedPublicKey: args?.expectedPublicKey,
          onPasskeyComplete: () => {
            try {
              navigator.vibrate?.(30);
            } catch {
              /* ignore */
            }
          },
        });
        return result;
      } catch (err) {
        const message = toUserErrorMessage(
          err,
          "Hold it flat against the back of your phone and try again.",
        );
        setError(message);
        throw err;
      } finally {
        setPending(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  return { authenticate, pending, error, clearError };
}
