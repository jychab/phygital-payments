"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { EmbedBoot } from "@/components/layout/embed-gate";

const PrivyReadyContext = createContext(false);
const PrivyRequestContext = createContext<() => void>(() => {});

/**
 * `ssr: false` is required so OpenNext does not put `@privy-io/react-auth`
 * in the Cloudflare Worker (10 MiB limit). A plain `import()` from this
 * root client module is still traced into the worker bundle.
 */
const PrivyWalletProvider = dynamic(
  () => import("./privy-wallet-provider").then((m) => m.PrivyWalletProvider),
  { ssr: false, loading: () => <EmbedBoot /> },
);

/**
 * Single app-wide Privy mount. Stays in the root tree so Home ↔ Device ↔
 * Collect share one session. The Privy SDK chunk loads only after a
 * `PrivyGate` asks for it — Collect's happy path never loads `@privy-io/react-auth`.
 */
export function PrivyWalletRoot({ children }: { children: ReactNode }) {
  const [requested, setRequested] = useState(false);

  const request = useCallback(() => {
    setRequested(true);
  }, []);

  return (
    <PrivyRequestContext.Provider value={request}>
      {requested ? (
        <PrivyWalletProvider>
          <PrivyReadyContext.Provider value={true}>
            {children}
          </PrivyReadyContext.Provider>
        </PrivyWalletProvider>
      ) : (
        <PrivyReadyContext.Provider value={false}>
          {children}
        </PrivyReadyContext.Provider>
      )}
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
