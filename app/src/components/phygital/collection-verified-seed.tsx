"use client";

import type { ReactNode } from "react";

import { PrivyGate } from "@/app/privy-wallet-root";
import { useExpectedWallet } from "@/hooks/wallet/use-expected-wallet";

/**
 * Collection detail may seed Confirmed only when the live Privy session
 * matches the token owner. `from=collection` alone is not trusted.
 */
export function CollectionVerifiedSeed({
  owner,
  fromCollection,
  children,
}: {
  owner: string;
  fromCollection: boolean;
  children: (args: {
    /** Show Back to Collection. */
    fromCollection: boolean;
    /** Confirmed seed — owner session only. */
    collectionVerified: boolean;
  }) => ReactNode;
}) {
  if (!fromCollection) {
    return <>{children({ fromCollection: false, collectionVerified: false })}</>;
  }

  return (
    <PrivyGate
      fallback={
        <>{children({ fromCollection: true, collectionVerified: false })}</>
      }
    >
      <CollectionVerifiedSeedInner owner={owner}>
        {children}
      </CollectionVerifiedSeedInner>
    </PrivyGate>
  );
}

function CollectionVerifiedSeedInner({
  owner,
  children,
}: {
  owner: string;
  children: (args: {
    fromCollection: boolean;
    collectionVerified: boolean;
  }) => ReactNode;
}) {
  const { matched, ready } = useExpectedWallet(owner);
  const collectionVerified = ready && matched;

  return (
    <>{children({ fromCollection: true, collectionVerified })}</>
  );
}
