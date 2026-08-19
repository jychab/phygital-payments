"use client";

import { useEffect, useState } from "react";

/**
 * True when this document is running inside an iframe.
 * `null` until mounted (avoids SSR / hydration mismatch).
 */
export function useIsEmbedded(): boolean | null {
  const [embedded, setEmbedded] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setEmbedded(window.self !== window.top);
    } catch {
      // Cross-origin parents throw on `window.top` access → treat as embedded.
      setEmbedded(true);
    }
  }, []);

  return embedded;
}
