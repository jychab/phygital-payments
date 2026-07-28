"use client";

import { Toaster } from "@/components/ui/sonner";
import { ParentWalletProvider } from "@/lib/wallet/parent-bridge";

/**
 * The app runs as an iframe embedded in the Revibase vault. It holds no wallet
 * of its own — the parent vault owns the wallet and answers address / signing
 * requests over postMessage (see lib/wallet/parent-bridge).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ParentWalletProvider>
      {children}
      <Toaster richColors position="top-center" />
    </ParentWalletProvider>
  );
}
