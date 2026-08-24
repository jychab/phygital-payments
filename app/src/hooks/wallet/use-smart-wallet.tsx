"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { clearAppClientStorage } from "@/lib/wallet/clear-client-session";
import { clearWalletSessionCookie } from "@/lib/wallet/wallet-session-client";
import { queryFetch, readJson } from "@/lib/queries/http";
import { queryKeys } from "@/lib/queries";
import { clearPersistedQueryCache } from "@/lib/queries/persist";
import {
  clearSmartWalletSession,
  loadSmartWalletSession,
  type SmartWalletSession,
} from "@/lib/lazorkit/credential-store";
import { toUserErrorMessage } from "@/lib/user-errors";

export type SmartWallet = {
  session: SmartWalletSession | null;
  isConnected: boolean;
  ready: boolean;
  connecting: boolean;
  signIn: () => void;
  signUp: () => void;
  disconnect: () => Promise<void>;
};

const SmartWalletContext = createContext<SmartWallet | null>(null);

export function SmartWalletProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<SmartWalletSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadSmartWalletSession().then(async (restored) => {
      if (cancelled) return;
      if (restored) {
        setSession(restored);
      }
      setReady(true);
      if (!restored) return;
      try {
        const res = await queryFetch("/api/wallet/session");
        if (res.status === 401 || res.status === 403) {
          await clearSmartWalletSession();
          if (!cancelled) setSession(null);
          return;
        }
        if (!res.ok) return;
        const body = await readJson<{
          session: { vaultPda: string } | null;
        }>(res, "Couldn’t restore session");
        if (body.session?.vaultPda !== String(restored.vaultPda)) {
          await clearSmartWalletSession();
          if (!cancelled) setSession(null);
        }
      } catch {
        /* keep local session on transient network errors */
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const signInMutation = useMutation({
    mutationFn: async () => {
      const mod = await import("@/lib/lazorkit/connect");
      return mod.signInSmartWallet();
    },
    onSuccess: (next) => setSession(next),
    onError: (error) => {
      toast.error(toUserErrorMessage(error, "Couldn't sign in with Face ID"));
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async () => {
      const mod = await import("@/lib/lazorkit/connect");
      return mod.signUpSmartWallet();
    },
    onSuccess: (next) => setSession(next),
    onError: (error) => {
      toast.error(toUserErrorMessage(error, "Couldn't create a passkey"));
    },
  });

  const signIn = useCallback(() => {
    if (session || signInMutation.isPending || signUpMutation.isPending) return;
    signInMutation.mutate();
  }, [session, signInMutation, signUpMutation.isPending]);

  const signUp = useCallback(() => {
    if (session || signInMutation.isPending || signUpMutation.isPending) return;
    signUpMutation.mutate();
  }, [session, signInMutation.isPending, signUpMutation]);

  const disconnect = useCallback(async () => {
    await clearWalletSessionCookie();
    setSession(null);
    await clearSmartWalletSession();
    clearAppClientStorage();
    queryClient.removeQueries({ queryKey: queryKeys.walletPortfolio.all() });
    queryClient.removeQueries({ queryKey: queryKeys.agentSession.all() });
    queryClient.removeQueries({ queryKey: queryKeys.walletActivity.all() });
    queryClient.removeQueries({ queryKey: queryKeys.nfcAccessories.all() });
    queryClient.removeQueries({ queryKey: queryKeys.phygitalToken.all() });
    clearPersistedQueryCache();
  }, [queryClient]);

  const value = useMemo<SmartWallet>(
    () => ({
      session,
      isConnected: Boolean(session),
      ready,
      connecting: signInMutation.isPending || signUpMutation.isPending,
      signIn,
      signUp,
      disconnect,
    }),
    [
      session,
      ready,
      signInMutation.isPending,
      signUpMutation.isPending,
      signIn,
      signUp,
      disconnect,
    ],
  );

  return (
    <SmartWalletContext.Provider value={value}>
      {children}
    </SmartWalletContext.Provider>
  );
}

export function useSmartWallet(): SmartWallet {
  const ctx = useContext(SmartWalletContext);
  if (!ctx) {
    throw new Error("useSmartWallet must be used within SmartWalletProvider");
  }
  return ctx;
}
