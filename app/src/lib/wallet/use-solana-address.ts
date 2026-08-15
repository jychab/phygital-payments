"use client";

import { useCallback } from "react";
import { useConnectWallet, usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";

import { useIsEmbedded } from "@/hooks/use-is-embedded";
import { clearPreauthApiKey } from "@/lib/payments/preauth-client";

/**
 * Connected Solana address from Privy (embedded or external wallet).
 *
 * Connect is always user-initiated. Disconnect drops Solana wallet sessions
 * and ends the Privy auth session when present. Connect is a no-op inside
 * iframes (payment-link embeds).
 */
export function useSolanaAddress(): {
  address: string | null;
  isConnected: boolean;
  ready: boolean;
  /** Open Privy login / wallet connect — never auto-creates a wallet. */
  connect: () => void;
  /** Disconnect Solana wallets and log out of Privy when authenticated. */
  disconnect: () => Promise<void>;
  authenticated: boolean;
} {
  const embedded = useIsEmbedded();
  const {
    ready: privyReady,
    authenticated,
    login,
    logout: privyLogout,
  } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { connectWallet } = useConnectWallet();

  const address = wallets[0]?.address ?? null;
  const ready = privyReady && walletsReady;

  const connect = useCallback(() => {
    // Payment-link iframes never prompt wallet connect.
    if (embedded) return;
    if (!privyReady) return;

    if (!authenticated) {
      // Login modal: Google and/or wallet. Embedded Solana wallets are minted
      // only when the user has none (createOnLogin: users-without-wallets).
      login();
      return;
    }

    if (address) return;

    // Logged in without a Solana wallet — prompt an external wallet connect.
    connectWallet({ walletChainType: "solana-only" });
  }, [embedded, privyReady, authenticated, address, login, connectWallet]);

  const disconnect = useCallback(async () => {
    clearPreauthApiKey();

    // Drop every connected Solana account first (works even with a stale
    // Privy session / invalid auth token).
    await Promise.all(
      wallets.map(async (wallet) => {
        try {
          await wallet.disconnect();
        } catch {
          /* ignore */
        }
      }),
    );

    if (privyReady && authenticated) {
      try {
        await privyLogout();
      } catch {
        // Invalid/stale token — wallets are already disconnected above.
      }
    }
  }, [wallets, privyReady, authenticated, privyLogout]);

  return {
    address,
    isConnected: Boolean(address),
    ready,
    connect,
    disconnect,
    authenticated,
  };
}
