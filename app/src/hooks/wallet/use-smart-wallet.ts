"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Address } from "@solana/kit";

import { toast } from "sonner";

import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { clearAppClientStorage } from "@/lib/wallet/clear-client-session";
import { createAndConnectSmartWallet } from "@/lib/lazorkit/connect";
import {
  clearSmartWalletSession,
  loadSmartWalletSession,
  type SmartWalletSession,
} from "@/lib/lazorkit/credential-store";
import { toUserErrorMessage } from "@/lib/user-errors";

export type SmartWallet = {
  address: string | null;
  vaultPda: Address | null;
  walletPda: Address | null;
  authorityPda: Address | null;
  session: SmartWalletSession | null;
  isConnected: boolean;
  ready: boolean;
  connect: () => void;
  disconnect: () => Promise<void>;
};

/**
 * App passkey session. `address` is the LazorKit vault PDA (token.owner).
 */
export function useSmartWallet(): SmartWallet {
  const embedded = useIsEmbedded();
  const queryClient = useQueryClient();
  const [session, setSession] = useState<SmartWalletSession | null>(null);
  const [ready, setReady] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadSmartWalletSession().then((restored) => {
      if (cancelled) return;
      setSession(restored);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const connect = useCallback(() => {
    if (embedded) return;
    if (session || connecting) return;
    setConnecting(true);
    void createAndConnectSmartWallet()
      .then((next) => {
        setSession(next);
      })
      .catch((error) => {
        toast.error(toUserErrorMessage(error, "Couldn’t create a passkey"));
      })
      .finally(() => {
        setConnecting(false);
      });
  }, [embedded, session, connecting]);

  const disconnect = useCallback(async () => {
    setSession(null);
    await clearSmartWalletSession();
    clearAppClientStorage();
    queryClient.clear();
  }, [queryClient]);

  const address = session ? String(session.vaultPda) : null;

  return {
    address,
    vaultPda: session?.vaultPda ?? null,
    walletPda: session?.walletPda ?? null,
    authorityPda: session?.authorityPda ?? null,
    session,
    isConnected: Boolean(session),
    ready: ready && !connecting,
    connect,
    disconnect,
  };
}
