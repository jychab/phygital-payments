"use client";

import { useCallback, useState } from "react";

import { authenticatePhygital } from "@/lib/phygital/authenticate";

export function useAuthenticatePhygital() {
  const [pending, setPending] = useState(false);

  const authenticate = useCallback(
    async (args?: { expectedPublicKey?: string }) => {
      setPending(true);
      try {
        return await authenticatePhygital(args);
      } finally {
        setPending(false);
      }
    },
    [],
  );

  return { authenticate, pending };
}
