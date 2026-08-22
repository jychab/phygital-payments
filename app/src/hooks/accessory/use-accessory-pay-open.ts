"use client";

import { useCallback, useSyncExternalStore } from "react";

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

/**
 * Pay on `/accessory` after an NFC tap. Stored on the URL so it survives a
 * refresh while Hold to Pay is open.
 */
export function useAccessoryPayOpen(): [boolean, (open: boolean) => void] {
  const open = useSyncExternalStore(
    subscribePayOpen,
    payOpenFromLocation,
    () => false,
  );

  const setOpen = useCallback((next: boolean) => {
    const url = new URL(window.location.href);
    if (next) url.searchParams.set(PAY_PARAM, "1");
    else url.searchParams.delete(PAY_PARAM);
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
