"use client";

import { useState } from "react";

import { authenticateAccessory } from "@/lib/accessory/authenticate";

export function useAuthenticateAccessory() {
  const [pending, setPending] = useState(false);

  async function authenticate(args?: { expectedPublicKey?: string }) {
    setPending(true);
    try {
      return await authenticateAccessory({
        expectedPublicKey: args?.expectedPublicKey,
      });
    } finally {
      setPending(false);
    }
  }

  return { authenticate, pending };
}
