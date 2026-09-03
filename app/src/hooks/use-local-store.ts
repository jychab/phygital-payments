"use client";

import { useSyncExternalStore } from "react";

import type { LocalStore } from "@/lib/local-store";

/** Subscribe to a device-local list store with SSR-safe empty snapshot. */
export function useLocalStore<T>(store: LocalStore<T>): readonly T[] {
  return useSyncExternalStore(store.subscribe, store.list, () => store.empty);
}
