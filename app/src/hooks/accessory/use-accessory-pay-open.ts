"use client";

import { useCallback, useSyncExternalStore } from "react";

import { stashDiscovery } from "@/lib/phygital/discovery-handoff";
import type { PhygitalSurface } from "@/lib/phygital/surface";

const PAY_PARAM = "pay";

const listeners = new Set<() => void>();

function payOpenFromLocation(): boolean {
  return new URLSearchParams(window.location.search).get(PAY_PARAM) === "1";
}

function subscribePayOpen(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  window.addEventListener("popstate", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("popstate", onStoreChange);
  };
}

function emitPayOpen() {
  for (const listener of listeners) listener();
}

export type OpenAccessoryPayArgs = {
  /** Token PDA — written to the URL so wallet IAB return / refresh can resume. */
  tokenAddress: string;
  passkey: string;
  surface?: PhygitalSurface;
};

/**
 * Pay on `/accessory` after authenticity. URL keeps tap params when present
 * so Confirmed stays tied to cryptographic proof; adds `address` + `pay=1`
 * for wallet IAB resume. Never stashes Confirmed in sessionStorage.
 */
export function useAccessoryPayOpen(): [
  boolean,
  (open: boolean | OpenAccessoryPayArgs) => void,
] {
  const open = useSyncExternalStore(
    subscribePayOpen,
    payOpenFromLocation,
    () => false,
  );

  const setOpen = useCallback((next: boolean | OpenAccessoryPayArgs) => {
    const url = new URL(window.location.href);

    if (next === false) {
      url.searchParams.delete(PAY_PARAM);
    } else if (next === true) {
      url.searchParams.set(PAY_PARAM, "1");
    } else {
      // Passkey only — so address route can load the token; not Confirmed.
      stashDiscovery({
        passkey: next.passkey,
        surface: next.surface ?? "accessory",
      });
      url.searchParams.set("address", next.tokenAddress);
      url.searchParams.set(PAY_PARAM, "1");
      // Keep pk/s/c/n when present — Confirmed requires live tap verify.
    }

    const href = `${url.pathname}${url.search}${url.hash}`;
    if (
      href ===
      `${window.location.pathname}${window.location.search}${window.location.hash}`
    ) {
      return;
    }
    window.history.replaceState(window.history.state, "", href);
    emitPayOpen();
  }, []);

  return [open, setOpen];
}
