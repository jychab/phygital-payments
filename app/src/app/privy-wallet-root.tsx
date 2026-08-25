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
  // Keep the rest of the app mounted while the chunk loads. A loading fallback
  // here would replace `{children}` and look like a full page refresh.
  { ssr: false, loading: () => null },
);

/**
 * Single app-wide Privy mount. Stays in the root tree so Home ↔ Accessory ↔
 * Collect ATA setup share one session. The Privy SDK chunk loads only after a
 * `PrivyGate` asks for it — Collect itself does not gate on Privy (only ATA
 * create does); Collect embeds never load `@privy-io/react-auth`.
 *
 * While the SDK loads, `{children}` stay as a sibling so local UI state is
 * not wiped. They move under `PrivyProvider` once the chunk is ready.
 */
export function PrivyWalletRoot({ children }: { children: ReactNode }) {
  const [requested, setRequested] = useState(false);
  const [ready, setReady] = useState(false);

  const request = useCallback(() => {
    setRequested(true);
  }, []);

  const markReady = useCallback(() => {
    setReady(true);
  }, []);

  const gated = (
    <PrivyRequestContext.Provider value={request}>
      <PrivyReadyContext.Provider value={ready}>
        {children}
      </PrivyReadyContext.Provider>
    </PrivyRequestContext.Provider>
  );

  return (
    <>
      {requested ? (
        <PrivyWalletProvider>
          {ready ? gated : <PrivyMountSignal onReady={markReady} />}
        </PrivyWalletProvider>
      ) : null}
      {ready ? null : gated}
    </>
  );
}

function PrivyMountSignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
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
