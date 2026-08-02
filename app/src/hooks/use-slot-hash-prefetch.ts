"use client";

import { useEffect, useRef } from "react";

import {
  prefetchSlotHash,
  SLOT_HASH_PREFETCH_TTL_MS,
  type SlotHashPrefetch,
} from "@/lib/payments/receive";

/**
 * Keep a fresh slot hash warmed while the receive panel is armed, so the NFC
 * prompt can fire without an RPC round trip at tap time. Returns a getter that
 * reads the latest value (or undefined if none is warm yet) at the moment of
 * the tap.
 */
export function useSlotHashPrefetch(enabled: boolean): () => SlotHashPrefetch | undefined {
  const ref = useRef<SlotHashPrefetch | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const refresh = () => {
      void prefetchSlotHash()
        .then((value) => {
          if (active) ref.current = value;
        })
        .catch(() => {
          // Best-effort — receive falls back to an on-demand fetch.
        });
    };
    refresh();
    // Refresh well within the usable window so the cached value never expires.
    const timer = setInterval(refresh, SLOT_HASH_PREFETCH_TTL_MS / 2);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [enabled]);

  return () => ref.current;
}
