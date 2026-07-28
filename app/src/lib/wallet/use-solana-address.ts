"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";

type PrivyUserLike = {
  linkedAccounts?: Array<{
    type: string;
    chainType?: string;
    address?: string;
  }>;
};

export function solanaAddressFromLinkedAccounts(
  user: PrivyUserLike | null | undefined,
): string | null {
  for (const account of user?.linkedAccounts ?? []) {
    if (
      account.type === "wallet" &&
      account.chainType === "solana" &&
      typeof account.address === "string" &&
      account.address.length > 0
    ) {
      return account.address;
    }
  }
  return null;
}

export function useSolanaAddress(): {
  address: string | null;
  isConnected: boolean;
  ready: boolean;
} {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();

  const address = wallets[0]?.address ?? solanaAddressFromLinkedAccounts(user);
  const isConnected = authenticated && !!address;

  return { address, isConnected, ready };
}
