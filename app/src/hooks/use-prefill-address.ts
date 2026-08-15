"use client";

import { useEffect } from "react";

/** When connected and the draft is empty, fill it once with the wallet address. */
export function usePrefillAddress(
  connectedAddress: string | null | undefined,
  draft: string,
  setDraft: (value: string) => void,
): void {
  useEffect(() => {
    if (connectedAddress && !draft.trim()) {
      setDraft(connectedAddress);
    }
  }, [connectedAddress, draft, setDraft]);
}
