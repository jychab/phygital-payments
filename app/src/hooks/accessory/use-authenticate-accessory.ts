"use client";

import { useCallback, useState } from "react";

import { authenticateAccessory } from "@/lib/accessory/authenticate";

/**
 * Hold to Check — live WebAuthn against a client-issued challenge.
 */
export function useAuthenticateAccessory() {
  const [pending, setPending] = useState(false);

  const authenticate = useCallback(
    async (args?: { expectedPublicKey?: string }) => {
      setPending(true);
      try {
        return await authenticateAccessory({
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
