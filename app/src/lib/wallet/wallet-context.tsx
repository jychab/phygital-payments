"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { useSignTransaction, useWallets } from "@privy-io/react-auth/solana";
import { LoaderCircle } from "lucide-react";
import { type TransactionPartialSigner } from "@solana/kit";

import {
  ParentBridge,
  getIframeProbeTimeoutMs,
  isInIframe,
} from "./parent-bridge";
import { makeParentSigner } from "./parent-signer";
import { makeKitSigner } from "./privy-signer";
import {
  PRIVY_APP_ID,
  privyConfig,
  solanaAddressFromLinkedAccounts,
} from "./privy-config";

/** How the connected wallet is provided. */
export type WalletMode = "parent" | "privy";

export type WalletValue = {
  /** Which backend is serving the wallet. */
  mode: WalletMode;
  /** Backend has finished initializing and its state can be trusted. */
  ready: boolean;
  /** Connected Solana address, or null when not connected. */
  address: string | null;
  isConnected: boolean;
  /** `@solana/kit` signer, or null until a wallet is connected. */
  signer: TransactionPartialSigner | null;
  login: () => void;
  logout: () => void;
};

const WalletContext = createContext<WalletValue | null>(null);

export function useWallet(): WalletValue {
  const value = useContext(WalletContext);
  if (!value) {
    throw new Error("useWallet must be used within <WalletProvider>");
  }
  return value;
}

/** The active kit signer, or null until a wallet is connected. */
export function useWalletSigner(): TransactionPartialSigner | null {
  return useWallet().signer;
}

type BackendState =
  | { status: "probing" }
  | { status: "parent"; bridge: ParentBridge; initialAddress: string }
  | { status: "privy" };

/**
 * Decide which wallet backend to use. When embedded in an iframe we probe the
 * parent window: if it answers the handshake, the parent becomes the wallet;
 * otherwise (and for normal top-level usage) we fall back to Privy.
 */
function useWalletBackend(): BackendState {
  // Start "probing" on both server and first client render so hydration matches;
  // the iframe check touches `window` and can only run after mount.
  const [state, setState] = useState<BackendState>({ status: "probing" });

  useEffect(() => {
    let active = true;

    if (!isInIframe()) {
      // Defer out of the synchronous effect body to avoid a cascading render.
      void Promise.resolve().then(() => {
        if (active) setState({ status: "privy" });
      });
      return () => {
        active = false;
      };
    }

    const bridge = new ParentBridge();
    bridge.start();

    void bridge.connect(getIframeProbeTimeoutMs()).then((address) => {
      if (!active) {
        bridge.stop();
        return;
      }
      if (address) {
        setState({ status: "parent", bridge, initialAddress: address });
      } else {
        bridge.stop();
        setState({ status: "privy" });
      }
    });

    return () => {
      active = false;
      bridge.stop();
    };
  }, []);

  return state;
}

function ParentWalletProvider({
  bridge,
  initialAddress,
  children,
}: {
  bridge: ParentBridge;
  initialAddress: string;
  children: React.ReactNode;
}) {
  const [address, setAddress] = useState<string | null>(initialAddress);

  useEffect(() => {
    bridge.onAccountsChanged(setAddress);
  }, [bridge]);

  const signer = useMemo(
    () => (address ? makeParentSigner(address, bridge) : null),
    [address, bridge],
  );

  const value = useMemo<WalletValue>(
    () => ({
      mode: "parent",
      ready: true,
      address,
      isConnected: !!address,
      signer,
      login: () => {
        void bridge.connect(getIframeProbeTimeoutMs()).then((next) => {
          if (next) setAddress(next);
        });
      },
      logout: () => {
        bridge.disconnect();
        setAddress(null);
      },
    }),
    [address, bridge, signer],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

function PrivyWalletProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { signTransaction } = useSignTransaction();

  const wallet = wallets[0] ?? null;
  const address = wallet?.address ?? solanaAddressFromLinkedAccounts(user);

  const signer = useMemo(
    () => (wallet ? makeKitSigner(signTransaction, wallet) : null),
    [wallet, signTransaction],
  );

  const value = useMemo<WalletValue>(
    () => ({
      mode: "privy",
      ready,
      address,
      isConnected: authenticated && !!address,
      signer,
      login,
      logout,
    }),
    [ready, authenticated, address, signer, login, logout],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

function WalletBoot() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Connecting…</p>
    </div>
  );
}

function PrivyConfigMissing() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
        Phygital Pay
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        Add{" "}
        <code className="font-mono text-foreground">NEXT_PUBLIC_PRIVY_APP_ID</code>{" "}
        to <code className="font-mono text-foreground">app/.env.local</code> (see{" "}
        <code className="font-mono text-foreground">.env.example</code>), or embed
        this app in a parent that supports the wallet bridge.
      </p>
    </div>
  );
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const backend = useWalletBackend();

  if (backend.status === "probing") {
    return <WalletBoot />;
  }

  if (backend.status === "parent") {
    return (
      <ParentWalletProvider
        bridge={backend.bridge}
        initialAddress={backend.initialAddress}
      >
        {children}
      </ParentWalletProvider>
    );
  }

  if (!PRIVY_APP_ID) {
    return <PrivyConfigMissing />;
  }

  return (
    <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
      <PrivyWalletProvider>{children}</PrivyWalletProvider>
    </PrivyProvider>
  );
}
