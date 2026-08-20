"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

import { EmbedBoot } from "@/components/layout/embed-gate";

const PrivyReadyContext = createContext(false);
const PrivyRequestContext = createContext<() => void>(() => {});

/**
 * Single app-wide Privy mount. Stays in the root tree so Home ↔ Device ↔
 * Collect share one session. The Privy SDK chunk loads only after a
 * `PrivyGate` asks for it — Collect's happy path never loads `@privy-io/react-auth`.
 */
export function PrivyWalletRoot({ children }: { children: ReactNode }) {
  const [requested, setRequested] = useState(false);
  const [Provider, setProvider] = useState<ComponentType<{
    children: ReactNode;
  }> | null>(null);

  const request = useCallback(() => {
    setRequested(true);
  }, []);

  useEffect(() => {
    if (!requested || Provider) return;
    let cancelled = false;
    void import("./privy-wallet-provider").then((m) => {
      if (!cancelled) setProvider(() => m.PrivyWalletProvider);
    });
    return () => {
      cancelled = true;
    };
  }, [requested, Provider]);

  const inner = Provider ? (
    <Provider>
      <PrivyReadyContext.Provider value={true}>{children}</PrivyReadyContext.Provider>
    </Provider>
  ) : (
    <PrivyReadyContext.Provider value={false}>{children}</PrivyReadyContext.Provider>
  );

  return (
    <PrivyRequestContext.Provider value={request}>
      {inner}
    </PrivyRequestContext.Provider>
  );
}

/** Load the root Privy provider if it isn't already. Returns true once mounted. */
export function usePrivyReady() {
  const request = useContext(PrivyRequestContext);
  const ready = useContext(PrivyReadyContext);

  useEffect(() => {
    request();
  }, [request]);

  return ready;
}

/** Don't render Privy hooks until the root provider exists. */
export function PrivyGate({
  children,
  fallback = <EmbedBoot />,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const ready = usePrivyReady();
  if (!ready) return fallback;
  return children;
}
