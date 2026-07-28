"use client";

import { Toaster } from "@/components/ui/sonner";
import { WalletProvider } from "@/lib/wallet/wallet-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WalletProvider>{children}</WalletProvider>
      <Toaster richColors position="top-center" />
    </>
  );
}
