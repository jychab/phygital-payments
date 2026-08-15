"use client";

import type { ReactNode } from "react";

import { PrivyWalletProvider } from "../providers";

/** Home + setup — Privy / wallet connect required. */
export default function WalletLayout({ children }: { children: ReactNode }) {
  return <PrivyWalletProvider>{children}</PrivyWalletProvider>;
}
