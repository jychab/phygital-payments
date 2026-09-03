"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  readWebauthnSession,
  writeWebauthnSession,
  type WebauthnSession,
} from "@/lib/token/webauthn-session";

let sessionSnapshot: WebauthnSession | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): WebauthnSession | null {
  return sessionSnapshot;
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function refreshSnapshot(): WebauthnSession | null {
  sessionSnapshot = readWebauthnSession();
  return sessionSnapshot;
}

function notify(): void {
  refreshSnapshot();
  for (const listener of listeners) {
    listener();
  }
}

/** Client WebAuthn proof for cold Hold-to-Check (survives HoldToCheckLanding remounts). */
export function useWebauthnSession() {
  const session = useSyncExternalStore(
    subscribe,
    () => getSnapshot(),
    () => null,
  );

  const markVerified = useCallback((secp256r1PublicKey: string) => {
    markWebauthnVerified(secp256r1PublicKey);
  }, []);

  return { session, markVerified };
}

/** Persist passkey proof and notify listeners (Recents reopen, Hold to Check). */
export function markWebauthnVerified(secp256r1PublicKey: string): void {
  writeWebauthnSession(secp256r1PublicKey);
  notify();
}

/** Hydrate from sessionStorage once on the client. */
export function initWebauthnSessionSnapshot(): void {
  if (typeof window === "undefined") return;
  refreshSnapshot();
}
