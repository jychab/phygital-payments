"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { stashDiscovery } from "@/lib/phygital/discovery-handoff";
import {
  phygitalHref,
  surfaceForToken,
  type PhygitalSurface,
} from "@/lib/phygital/surface";
import type { PhygitalToken } from "@/lib/phygital/token";

/**
 * Send a resolved token to `/card` or `/accessory`. Hold-to-Check (empty
 * search) stashes the passkey so the destination can reopen the same token.
 * Does not stash Confirmed — badge requires tap params or WebAuthn again.
 */
export function useEnsurePhygitalSurface(
  token: PhygitalToken | null | undefined,
  current: PhygitalSurface,
): boolean {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expected = token ? surfaceForToken(token) : null;
  const mismatch = Boolean(expected && expected !== current);

  useEffect(() => {
    if (!token || !expected || expected === current) return;
    const search = searchParams.toString();
    if (!search) {
      stashDiscovery({
        passkey: token.secp256r1PublicKey,
        surface: expected,
      });
    }
    router.replace(phygitalHref(expected, search));
  }, [token, expected, current, router, searchParams]);

  return mismatch;
}
