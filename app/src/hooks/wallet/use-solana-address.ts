"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  usePrivy,
  type WalletWithMetadata,
} from "@privy-io/react-auth";
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

function isExportablePrivySolanaWallet(
  account: { type: string },
  address: string,
): account is WalletWithMetadata {
  return (
    account.type === "wallet" &&
    "walletClientType" in account &&
    account.walletClientType === "privy" &&
    "chainType" in account &&
    account.chainType === "solana" &&
    "address" in account &&
    account.address === address
  );
}

/**
 * Connected Solana address from Privy `useWallets()`.
 * Connect opens Privy login (Google or wallet); disconnect logs out.
 */
export function useSolanaAddress(): {
  address: string | null;
  isConnected: boolean;
  ready: boolean;
  /** Wallet-standard icon (data URL) for the connected wallet, if any. */
  walletIcon: string | null;
  /** Wallet-standard display name (e.g. "Phantom"). */
  walletName: string | null;
  /**
   * True when the connected address is a Privy Solana embedded wallet
   * the user can export via `exportWallet`.
   */
  canExportWallet: boolean;
  /** Open Privy login (Google or wallet). */
  connect: () => void;
  /** Disconnect wallets, log out of Privy, and clear app storage / query cache. */
  disconnect: () => Promise<void>;
} {
  const embedded = useIsEmbedded();
  const queryClient = useQueryClient();
  const {
    ready: privyReady,
    authenticated,
    user,
    login,
    logout,
  } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
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
  const canExportWallet = Boolean(
    ready &&
      authenticated &&
      address &&
      user?.linkedAccounts.some((account) =>
        isExportablePrivySolanaWallet(account, address),
      ),
  );

  const connect = useCallback(() => {
    if (embedded) return;
    if (!privyReady) return;
    if (walletAddress && !cleared) return;

    setSessionCleared(false);
    void login();
  }, [embedded, privyReady, walletAddress, cleared, login]);

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

    if (authenticated) {
      try {
        await logout();
      } catch {
        /* ignore */
      }
    }
  }, [wallets, queryClient, authenticated, logout]);

  return {
    address,
    isConnected: Boolean(address),
    ready,
    walletIcon,
    walletName,
    canExportWallet,
    connect,
    disconnect,
  };
}
