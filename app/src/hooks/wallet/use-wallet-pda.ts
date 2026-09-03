"use client";

import { useEffect, useState } from "react";

import { walletPdaForToken } from "@/lib/wallet/pda";

/** Resolve wallet PDA for a phygital token address. */
export function useWalletPda(tokenAddress: string | null) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [pending, setPending] = useState(Boolean(tokenAddress));

  useEffect(() => {
    if (!tokenAddress) {
      setWallet(null);
      setPending(false);
      return;
    }
    let cancelled = false;
    setPending(true);
    void walletPdaForToken(tokenAddress).then(
      (pda) => {
        if (!cancelled) {
          setWallet(String(pda));
          setPending(false);
        }
      },
      () => {
        if (!cancelled) {
          setWallet(null);
          setPending(false);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [tokenAddress]);

  return { walletAddress: wallet, pending };
}
