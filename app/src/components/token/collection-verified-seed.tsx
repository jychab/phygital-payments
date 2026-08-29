"use client";

import type { ReactNode } from "react";

import { useExpectedWallet } from "@/hooks/wallet/use-expected-wallet";

/**
 * Collection detail may seed Confirmed only when the live wallet session
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
  const { matched } = useExpectedWallet(owner);

  if (!fromCollection) {
    return <>{children({ fromCollection: false, collectionVerified: false })}</>;
  }

  return <>{children({ fromCollection: true, collectionVerified: matched })}</>;
}
