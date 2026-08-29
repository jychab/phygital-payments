"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useConnector } from "@solana/connector/react";
import { useQueryClient } from "@tanstack/react-query";

import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { clearAppClientStorage } from "@/lib/wallet/clear-client-session";

/**
 * Shared across every `useSolanaAddress` consumer so disconnect hides the
 * wallet on all routes immediately — even before ConnectorKit finishes disconnect.
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

/** Open the wallet picker overlay (module-level so ConnectGate can trigger it). */
let pickerOpen = false;
const pickerListeners = new Set<() => void>();

function subscribePicker(onStoreChange: () => void): () => void {
  pickerListeners.add(onStoreChange);
  return () => {
    pickerListeners.delete(onStoreChange);
  };
}

function getPickerOpen(): boolean {
  return pickerOpen;
}

export function setWalletPickerOpen(next: boolean): void {
  if (pickerOpen === next) return;
  pickerOpen = next;
  for (const listener of pickerListeners) listener();
}

export function useWalletPickerOpen(): boolean {
  return useSyncExternalStore(subscribePicker, getPickerOpen, () => false);
}

/**
 * Connected Solana address from ConnectorKit.
 * `connect` opens the wallet picker; auto-reconnect restores a prior session.
 */
export function useSolanaAddress(): {
  address: string | null;
  isConnected: boolean;
  /** Wallet-standard icon (data URL) for the connected wallet, if any. */
  walletIcon: string | null;
  /** Wallet-standard display name (e.g. "Phantom"). */
  walletName: string | null;
  /** Open the wallet picker (no-op in embeds / when already connected). */
  connect: () => void;
  /** Disconnect wallet and clear app storage / query cache. */
  disconnect: () => Promise<void>;
} {
  const embedded = useIsEmbedded();
  const queryClient = useQueryClient();
  const { account, connector, disconnectWallet } = useConnector();
  const cleared = useSyncExternalStore(
    subscribeSessionCleared,
    getSessionCleared,
    () => false,
  );

  const walletAddress = account ?? null;
  const address = cleared ? null : walletAddress;
  const walletIcon =
    !cleared && connector?.icon ? connector.icon : null;
  const walletName = cleared ? null : (connector?.name ?? null);

  const connect = useCallback(() => {
    if (embedded) return;
    if (walletAddress && !cleared) return;
    setSessionCleared(false);
    setWalletPickerOpen(true);
  }, [embedded, walletAddress, cleared]);

  const disconnect = useCallback(async () => {
    setSessionCleared(true);
    setWalletPickerOpen(false);
    clearAppClientStorage();
    queryClient.clear();

    try {
      await disconnectWallet();
    } catch {
      /* ignore */
    }
  }, [queryClient, disconnectWallet]);

  return {
    address,
    isConnected: Boolean(address),
    walletIcon,
    walletName,
    connect,
    disconnect,
  };
}
