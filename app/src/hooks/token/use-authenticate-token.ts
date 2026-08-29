"use client";

import { useCallback, useState } from "react";

import { authenticateToken } from "@/lib/token/authenticate";

/**
 * Hold to Check — live WebAuthn against a client-issued challenge.
 */
export function useAuthenticateToken() {
  const [pending, setPending] = useState(false);

  const authenticate = useCallback(
    async (args?: { expectedPublicKey?: string }) => {
      setPending(true);
      try {
        return await authenticateToken({
          expectedPublicKey: args?.expectedPublicKey,
          onPasskeyComplete: () => {
            try {
              navigator.vibrate?.(30);
            } catch {
              /* ignore */
            }
          },
        });
      } finally {
        setPending(false);
      }
    },
    [],
  );

  return { authenticate, pending };
}
