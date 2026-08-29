"use client";

import { useCallback, useSyncExternalStore } from "react";

const PAY_PARAM = "pay";

const listeners = new Set<() => void>();

export type TokenPayMode = "manage" | "setup";

export type TokenPayState = {
  open: boolean;
  mode: TokenPayMode | null;
};

/** Stable refs — `useSyncExternalStore` compares snapshots with Object.is. */
const PAY_CLOSED: TokenPayState = { open: false, mode: null };
const PAY_MANAGE: TokenPayState = { open: true, mode: "manage" };
const PAY_SETUP: TokenPayState = { open: true, mode: "setup" };

function payStateFromLocation(): TokenPayState {
  const pay = new URLSearchParams(window.location.search).get(PAY_PARAM);
  if (pay === "manage") return PAY_MANAGE;
  if (pay === "setup") return PAY_SETUP;
  // Unknown / legacy `pay=hold` → closed
  return PAY_CLOSED;
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

export type OpenTokenPayArgs = {
  /** Token PDA — written to the URL so refresh can resume. */
  tokenAddress: string;
  /** Setup = paste key (no Connect); Manage = Connect + settings. */
  mode: TokenPayMode;
};

/**
 * Pay screens on `/token` after authenticity. URL keeps tap params when present
 * so Confirmed stays tied to cryptographic proof; adds `address` + `pay=manage|setup`
 * for resume.
 */
export function useTokenPayOpen(): [
  TokenPayState,
  (open: false | OpenTokenPayArgs) => void,
] {
  const state = useSyncExternalStore(
    subscribePayOpen,
    payStateFromLocation,
    () => PAY_CLOSED,
  );

  const setOpen = useCallback((next: false | OpenTokenPayArgs) => {
    const url = new URL(window.location.href);

    if (next === false) {
      url.searchParams.delete(PAY_PARAM);
    } else {
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
