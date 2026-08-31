"use client";

import { useCallback, useRef } from "react";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useActiveSolanaWallet } from "@/hooks/wallet/use-active-solana-wallet";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { toUserErrorMessage } from "@/lib/user-errors";
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
  const loginInFlight = useRef(false);
  const {
    ready: walletsReady,
    wallet,
    address,
    linked,
    isEmbeddedWallet,
  } = useActiveSolanaWallet();

  const connectReady = !inEmbed && privyReady && walletsReady;

  const connect = useCallback(async () => {
    if (inEmbed || address || loginInFlight.current) return;
    if (!connectReady) {
      toast.message("Wallet is still loading", {
        description: "Try Connect again in a moment.",
      });
      return;
    }
    loginInFlight.current = true;
    try {
      login();
    } catch (err) {
      toast.error(toUserErrorMessage(err, "Couldn’t open wallet login"));
    } finally {
      loginInFlight.current = false;
    }
  }, [inEmbed, connectReady, address, login]);

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
    connectReady,
    walletIcon: wallet?.standardWallet.icon ?? null,
    walletName:
      wallet?.standardWallet.name ??
      (isEmbeddedWallet ? "Privy" : (linked?.walletClientType ?? null)),
    isEmbeddedWallet,
    connect,
    disconnect,
  };
}
