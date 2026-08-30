"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { useQueryClient } from "@tanstack/react-query";

import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { clearAppClientStorage } from "@/lib/wallet/clear-client-session";

/**
 * Shared across every `useSolanaAddress` consumer so disconnect hides the
 * wallet on all routes immediately — even before Privy finishes logout.
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

function isPrivyEmbeddedWallet(wallet: {
  standardWallet: { name: string };
}): boolean {
  return wallet.standardWallet.name === "Privy";
}

/**
 * Connected Solana address from Privy (embedded or external / MWA).
 * `connect` opens the Privy login modal; session restore reconnects automatically.
 */
export function useSolanaAddress(): {
  address: string | null;
  isConnected: boolean;
  /** Wallet-standard icon (data URL) for the connected wallet, if any. */
  walletIcon: string | null;
  /** Wallet-standard display name (e.g. "Phantom" or "Privy"). */
  walletName: string | null;
  /** True when the active wallet is a Privy Solana embedded wallet. */
  isEmbeddedWallet: boolean;
  /** Open the Privy login modal (no-op in embeds / when already connected). */
  connect: () => void;
  /** Log out of Privy and clear app storage / query cache. */
  disconnect: () => Promise<void>;
} {
  const embedded = useIsEmbedded();
  const queryClient = useQueryClient();
  const { ready: privyReady, authenticated, logout } = usePrivy();
  const { login } = useLogin();
  const { wallets, ready: walletsReady } = useWallets();
  const cleared = useSyncExternalStore(
    subscribeSessionCleared,
    getSessionCleared,
    () => false,
  );

  const wallet = wallets[0] ?? null;
  const walletAddress = wallet?.address ?? null;
  const address = cleared ? null : walletAddress;
  const walletIcon =
    !cleared && wallet?.standardWallet.icon
      ? wallet.standardWallet.icon
      : null;
  const walletName = cleared ? null : (wallet?.standardWallet.name ?? null);
  const isEmbeddedWallet = Boolean(
    !cleared && wallet && isPrivyEmbeddedWallet(wallet),
  );

  const canConnect = useMemo(
    () => privyReady && walletsReady && !embedded,
    [privyReady, walletsReady, embedded],
  );

  const connect = useCallback(() => {
    if (!canConnect) return;
    if (walletAddress && !cleared && authenticated) return;
    setSessionCleared(false);
    login();
  }, [canConnect, walletAddress, cleared, authenticated, login]);

  const disconnect = useCallback(async () => {
    setSessionCleared(true);
    clearAppClientStorage();
    queryClient.clear();

    try {
      await logout();
    } catch {
      /* ignore */
    }
  }, [queryClient, logout]);

  return {
    address,
    isConnected: Boolean(address),
    walletIcon,
    walletName,
    isEmbeddedWallet,
    connect,
    disconnect,
  };
}
