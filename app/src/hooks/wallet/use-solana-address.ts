"use client";

import { useCallback } from "react";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";

import { useActiveSolanaWallet } from "@/hooks/wallet/use-active-solana-wallet";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { clearAppClientStorage } from "@/lib/wallet/clear-client-session";

/**
 * Active Solana address from Privy (embedded or external / MWA).
 * `connect` opens Privy’s login modal (Google + detected Solana wallets).
 * Address follows the wallet used to authenticate, not auto-connect order.
 */
export function useSolanaAddress() {
  const inEmbed = useIsEmbedded();
  const queryClient = useQueryClient();
  const { ready: privyReady, authenticated, logout } = usePrivy();
  const { login } = useLogin();
  const {
    ready: walletsReady,
    wallet,
    address,
    linked,
    isEmbeddedWallet,
  } = useActiveSolanaWallet();

  const connect = useCallback(() => {
    if (inEmbed || !privyReady || !walletsReady) return;
    if (address) return;
    login();
  }, [inEmbed, privyReady, walletsReady, address, login]);

  const disconnect = useCallback(async () => {
    clearAppClientStorage();
    queryClient.clear();
    try {
      await wallet?.disconnect();
    } catch {
      /* ignore */
    }
    if (authenticated) {
      try {
        await logout();
      } catch {
        /* ignore */
      }
    }
  }, [queryClient, wallet, authenticated, logout]);

  return {
    address,
    isConnected: Boolean(address),
    walletIcon: wallet?.standardWallet.icon ?? null,
    walletName:
      wallet?.standardWallet.name ??
      (isEmbeddedWallet ? "Privy" : (linked?.walletClientType ?? null)),
    isEmbeddedWallet,
    connect,
    disconnect,
  };
}
