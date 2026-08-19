"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useConnectWallet, usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { useQueryClient } from "@tanstack/react-query";

import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { clearAppClientStorage } from "@/lib/wallet/clear-client-session";

/**
 * Shared across every `useSolanaAddress` consumer so disconnect hides the
 * wallet on all routes immediately — even before Privy finishes disconnect.
 */
let sessionCleared = false;
const sessionListeners = new Set<() => void>();

function subscribeSessionCleared(onStoreChange: () => void): () => void {
  sessionListeners.add(onStoreChange);
  return () => {
    sessionListeners.delete(onStoreChange);
  };
}

function getSessionCleared(): boolean {
  return sessionCleared;
}

function setSessionCleared(next: boolean): void {
  if (sessionCleared === next) return;
  sessionCleared = next;
  for (const listener of sessionListeners) listener();
}

/**
 * Connected Solana address from Privy `useWallets()`.
 * Connect / disconnect are wallet-only (`connectWallet` / `wallet.disconnect`).
 */
export function useSolanaAddress(): {
  address: string | null;
  isConnected: boolean;
  ready: boolean;
  /** Wallet-standard icon (data URL) for the connected wallet, if any. */
  walletIcon: string | null;
  /** Wallet-standard display name (e.g. "Phantom"). */
  walletName: string | null;
  /** Open Privy wallet-connect modal — never logs the user into Privy. */
  connect: () => void;
  /** Disconnect wallets + clear app storage / query cache. */
  disconnect: () => Promise<void>;
} {
  const embedded = useIsEmbedded();
  const queryClient = useQueryClient();
  const {
    ready: privyReady,
  } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { connectWallet } = useConnectWallet();
  const cleared = useSyncExternalStore(
    subscribeSessionCleared,
    getSessionCleared,
    () => false,
  );

  const wallet = wallets[0] ?? null;
  const walletAddress = wallet?.address ?? null;
  const address = cleared ? null : walletAddress;
  const ready = privyReady && walletsReady;
  const walletIcon =
    !cleared && wallet?.standardWallet.icon
      ? wallet.standardWallet.icon
      : null;
  const walletName =
    !cleared && wallet?.standardWallet.name
      ? wallet.standardWallet.name
      : null;

  const connect = useCallback(() => {
    if (embedded) return;
    if (!privyReady) return;
    if (walletAddress && !cleared) return;

    setSessionCleared(false);
    void connectWallet();
  }, [embedded, privyReady, walletAddress, cleared, connectWallet]);

  const disconnect = useCallback(async () => {
    setSessionCleared(true);
    clearAppClientStorage();
    queryClient.clear();

    await Promise.all(
      wallets.map(async (w) => {
        try {
          await w.disconnect();
        } catch {
          /* ignore */
        }
      }),
    );
  }, [wallets, queryClient]);

  return {
    address,
    isConnected: Boolean(address),
    ready,
    walletIcon,
    walletName,
    connect,
    disconnect,
  };
}
