"use client";

import { useEffect, useState } from "react";

import { isInAppBrowser } from "@/lib/browser/in-app-browser";

/** False until mounted (avoids SSR/client mismatch). */
export function useIsInAppBrowser(): boolean {
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    setInApp(isInAppBrowser());
  }, []);

  return inApp;
}
