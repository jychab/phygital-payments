"use client";

import { useCallback, useSyncExternalStore } from "react";

import { stashDiscovery } from "@/lib/phygital/discovery-handoff";
import type { PhygitalSurface } from "@/lib/phygital/surface";

const PAY_PARAM = "pay";

const listeners = new Set<() => void>();

export type AccessoryPayMode = "hold" | "manage";

export type AccessoryPayState = {
  open: boolean;
  mode: AccessoryPayMode | null;
};

function payStateFromLocation(): AccessoryPayState {
  const pay = new URLSearchParams(window.location.search).get(PAY_PARAM);
  if (pay === "hold") return { open: true, mode: "hold" };
  if (pay === "manage") return { open: true, mode: "manage" };
  return { open: false, mode: null };
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
  /** Hold = API-key Pay; Manage = Connect + settings. */
  mode: AccessoryPayMode;
};

/**
 * Pay on `/accessory` after authenticity. URL keeps tap params when present
 * so Confirmed stays tied to cryptographic proof; adds `address` + `pay=hold|manage`
 * for resume. Never stashes Confirmed in sessionStorage.
 */
export function useAccessoryPayOpen(): [
  AccessoryPayState,
  (open: false | OpenAccessoryPayArgs) => void,
] {
  const state = useSyncExternalStore(
    subscribePayOpen,
    payStateFromLocation,
    (): AccessoryPayState => ({ open: false, mode: null }),
  );

  const setOpen = useCallback((next: false | OpenAccessoryPayArgs) => {
    const url = new URL(window.location.href);

    if (next === false) {
      url.searchParams.delete(PAY_PARAM);
    } else {
      // Passkey only — so address route can load the token; not Confirmed.
      stashDiscovery({
        passkey: next.passkey,
        surface: next.surface ?? "accessory",
      });
      url.searchParams.set("address", next.tokenAddress);
      url.searchParams.set(PAY_PARAM, next.mode);
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

  return [state, setOpen];
}
