"use client";

import type { ReactNode } from "react";

import { useExpectedWallet } from "@/hooks/wallet/use-expected-wallet";

/** Seed Confirmed when the connected wallet matches the token owner. */
export function CollectionVerifiedSeed({
  owner,
  children,
}: {
  owner: string;
  children: (args: { ownerVerified: boolean }) => ReactNode;
}) {
  const { matched } = useExpectedWallet(owner);
  return <>{children({ ownerVerified: matched })}</>;
}
