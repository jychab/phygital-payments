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
import { useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { clearAppClientStorage } from "@/lib/wallet/clear-client-session";
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
  connect: () => void;
  disconnect: () => Promise<void>;
};

const SmartWalletContext = createContext<SmartWallet | null>(null);

export function SmartWalletProvider({ children }: { children: ReactNode }) {
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
    if (session || connecting) return;
    setConnecting(true);
    void import("@/lib/lazorkit/connect")
      .then(({ createAndConnectSmartWallet }) => createAndConnectSmartWallet())
      .then((next) => {
        setSession(next);
      })
      .catch((error) => {
        toast.error(toUserErrorMessage(error, "Couldn’t create a passkey"));
      })
      .finally(() => {
        setConnecting(false);
      });
  }, [session, connecting]);

  const disconnect = useCallback(async () => {
    setSession(null);
    await clearSmartWalletSession();
    clearAppClientStorage();
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<SmartWallet>(
    () => ({
      session,
      isConnected: Boolean(session),
      ready,
      connecting,
      connect,
      disconnect,
    }),
    [session, ready, connecting, connect, disconnect],
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
