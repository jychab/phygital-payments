"use client";

import { useCallback, useSyncExternalStore } from "react";

const PAY_PARAM = "pay";

const listeners = new Set<() => void>();

export type TokenPayState = {
  open: boolean;
};

/** Stable refs — `useSyncExternalStore` compares snapshots with Object.is. */
const PAY_CLOSED: TokenPayState = { open: false };
const PAY_OPEN: TokenPayState = { open: true };

function payStateFromLocation(): TokenPayState {
  const pay = new URLSearchParams(window.location.search).get(PAY_PARAM);
  if (pay === "manage") return PAY_OPEN;
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
};

/**
 * Pay settings on `/token` after authenticity. URL keeps tap params when present
 * so Confirmed stays tied to cryptographic proof; adds `address` + `pay=manage`
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
      url.searchParams.set(PAY_PARAM, "manage");
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
