"use client";

import { useMemo } from "react";
import { usePrivy, type User, type Wallet } from "@privy-io/react-auth";
import {
  useWallets,
  type ConnectedStandardSolanaWallet,
} from "@privy-io/react-auth/solana";

type LinkedSolanaWallet = Wallet & {
  type: "wallet";
  latestVerifiedAt: Date | null;
  firstVerifiedAt: Date | null;
};

function isLinkedSolanaWallet(account: User["linkedAccounts"][number]): account is LinkedSolanaWallet {
  return account.type === "wallet" && account.chainType === "solana";
}

function isPrivyEmbeddedClient(walletClientType: string | undefined): boolean {
  return walletClientType === "privy" || walletClientType === "privy-v2";
}

/** Solana linked wallet most recently used to log in / link (not connect order). */
export function preferredLinkedSolanaWallet(
  user: User | null | undefined,
): LinkedSolanaWallet | null {
  if (!user) return null;
  const linked = user.linkedAccounts.filter(isLinkedSolanaWallet);
  if (linked.length === 0) return null;
  return linked.reduce((best, next) => {
    const bestAt = best.latestVerifiedAt?.getTime() ?? 0;
    const nextAt = next.latestVerifiedAt?.getTime() ?? 0;
    return nextAt > bestAt ? next : best;
  });
}

/**
 * Connected Solana wallet that matches the authenticated login identity.
 * Ignores silently auto-connected wallets that aren't the login account.
 */
export function useActiveSolanaWallet(): {
  ready: boolean;
  wallet: ConnectedStandardSolanaWallet | null;
  linked: LinkedSolanaWallet | null;
  address: string | null;
  isEmbeddedWallet: boolean;
} {
  const { ready: privyReady, authenticated, user } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  return useMemo(() => {
    const ready = privyReady && walletsReady;
    const linked = preferredLinkedSolanaWallet(user);

    // Login is the only entrypoint — don't surface auto-connected wallets
    // until Privy has an authenticated Solana identity.
    if (!authenticated || !linked) {
      return {
        ready,
        wallet: null,
        linked: null,
        address: null,
        isEmbeddedWallet: false,
      };
    }

    const wallet =
      wallets.find((w) => w.address === linked.address) ?? null;

    return {
      ready,
      wallet,
      linked,
      // Show the login wallet even if the connector hasn't finished attaching.
      address: wallet?.address ?? linked.address,
      isEmbeddedWallet: isPrivyEmbeddedClient(linked.walletClientType),
    };
  }, [privyReady, walletsReady, authenticated, user, wallets]);
}
