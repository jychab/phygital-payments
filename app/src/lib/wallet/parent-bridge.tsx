"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  BRIDGE_MESSAGE,
  BRIDGE_PROTOCOL_VERSION,
  base64ToBytes,
  bytesToBase64,
  isParentToChildMessage,
  type ParentToChildMessage,
  type SignRequestMessage,
} from "@/lib/wallet/bridge-protocol";

/** How long to wait for a sign-response before rejecting. */
const SIGN_TIMEOUT_MS = 120_000;

/**
 * If the parent never answers the handshake (e.g. opened outside a vault), stop
 * showing the connecting spinner after this long and fall back to the "open
 * from your vault" UI.
 */
const HANDSHAKE_TIMEOUT_MS = 4_000;

type BridgeState = {
  address: string | null;
  chain: string | null;
  ready: boolean;
};

type BridgeContextValue = BridgeState & {
  isConnected: boolean;
  /** True when running inside a host frame (the vault), vs. opened standalone. */
  isEmbedded: boolean;
  /** Sign unsigned wire bytes via the parent wallet; resolves to signed wire. */
  signTransaction: (wire: Uint8Array) => Promise<Uint8Array>;
};

const BridgeContext = createContext<BridgeContextValue | null>(null);

/** True when running inside a frame (has a parent window to talk to). */
function isFramed(): boolean {
  try {
    return typeof window !== "undefined" && window.parent !== window;
  } catch {
    return true; // cross-origin access throws → we are framed
  }
}

// Client-only fact, read without a hydration mismatch (false on the server, the
// real value after mount) and without setState-in-effect.
const noopSubscribe = () => () => {};
function useIsEmbedded(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => isFramed(),
    () => false,
  );
}

type PendingSign = {
  resolve: (wire: Uint8Array) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

export function ParentWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<BridgeState>({
    address: null,
    chain: null,
    ready: false,
  });
  const isEmbedded = useIsEmbedded();
  const pendingRef = useRef<Map<string, PendingSign>>(new Map());

  const postToParent = useCallback((message: unknown) => {
    if (!isFramed()) return;
    // Permissionless bridge: any host may embed and answer this app. Nothing
    // sensitive crosses — signing still requires the user to approve in the
    // parent's wallet modal — so we post to any origin.
    window.parent.postMessage(message, "*");
  }, []);

  useEffect(() => {
    // Mark ready (drop the connecting spinner) once we either hear from the
    // parent or give up waiting. Deferred via timer so we never setState
    // synchronously in the effect body. Standalone (not embedded) has no parent
    // to hear from, so a 0ms timer flips straight to the fallback UI.
    const readyFallback = setTimeout(
      () => setState((s) => (s.ready ? s : { ...s, ready: true })),
      isFramed() ? HANDSHAKE_TIMEOUT_MS : 0,
    );

    if (!isFramed()) {
      return () => clearTimeout(readyFallback);
    }

    const pending = pendingRef.current;

    function onMessage(event: MessageEvent) {
      // Only accept messages from our parent frame (integrity, not an origin
      // allowlist) — any origin loaded there may drive the bridge.
      if (event.source !== window.parent) return;
      const data: unknown = event.data;
      if (!isParentToChildMessage(data)) return;
      const message = data as ParentToChildMessage;

      if (message.type === BRIDGE_MESSAGE.wallet) {
        setState({
          address: message.address,
          chain: message.chain,
          ready: true,
        });
        return;
      }

      if (message.type === BRIDGE_MESSAGE.signResponse) {
        const entry = pending.get(message.id);
        if (!entry) return;
        pending.delete(message.id);
        clearTimeout(entry.timer);
        if (message.error || !message.signedTransaction) {
          entry.reject(new Error(message.error ?? "Signing failed"));
          return;
        }
        entry.resolve(base64ToBytes(message.signedTransaction));
      }
    }

    window.addEventListener("message", onMessage);
    // Announce readiness so the parent sends the initial wallet handshake.
    postToParent({ type: BRIDGE_MESSAGE.ready, v: BRIDGE_PROTOCOL_VERSION });

    return () => {
      clearTimeout(readyFallback);
      window.removeEventListener("message", onMessage);
      for (const entry of pending.values()) {
        clearTimeout(entry.timer);
        entry.reject(new Error("Wallet bridge disconnected"));
      }
      pending.clear();
    };
  }, [postToParent]);

  const signTransaction = useCallback(
    (wire: Uint8Array): Promise<Uint8Array> => {
      if (!isFramed()) {
        return Promise.reject(
          new Error("No wallet — open this from your Revibase vault"),
        );
      }
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      return new Promise<Uint8Array>((resolve, reject) => {
        const timer = setTimeout(() => {
          pendingRef.current.delete(id);
          reject(new Error("Timed out waiting for wallet signature"));
        }, SIGN_TIMEOUT_MS);
        pendingRef.current.set(id, { resolve, reject, timer });

        const request: SignRequestMessage = {
          type: BRIDGE_MESSAGE.signRequest,
          v: BRIDGE_PROTOCOL_VERSION,
          id,
          transaction: bytesToBase64(wire),
        };
        postToParent(request);
      });
    },
    [postToParent],
  );

  const value = useMemo<BridgeContextValue>(
    () => ({
      ...state,
      isConnected: !!state.address,
      isEmbedded,
      signTransaction,
    }),
    [state, isEmbedded, signTransaction],
  );

  return (
    <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>
  );
}

export function useParentWallet(): BridgeContextValue {
  const value = useContext(BridgeContext);
  if (!value) {
    throw new Error("useParentWallet must be used within ParentWalletProvider");
  }
  return value;
}
