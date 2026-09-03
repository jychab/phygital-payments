/** React Query key factories. Keep in sync with `persist.ts` root names. */

export const queryKeys = {
  dasCollectible: {
    all: () => ["dasCollectible"] as const,
    byMint: (mint: string | null) =>
      [...queryKeys.dasCollectible.all(), mint] as const,
    batch: (mints: string[]) =>
      [
        ...queryKeys.dasCollectible.all(),
        "batch",
        ...[...mints].sort(),
      ] as const,
  },

  mintedCollectibleView: {
    all: () => ["mintedCollectibleView"] as const,
    byMint: (mint: string | null) =>
      [...queryKeys.mintedCollectibleView.all(), mint] as const,
  },

  tapVerify: {
    all: () => ["tapVerify"] as const,
    byParams: (params: string) =>
      [...queryKeys.tapVerify.all(), params] as const,
  },

  walletPortfolio: {
    all: () => ["walletPortfolio"] as const,
    byOwner: (owner: string | null) =>
      [...queryKeys.walletPortfolio.all(), owner] as const,
  },

  walletActivity: {
    all: () => ["walletActivity"] as const,
    byOwner: (owner: string | null, limit = 20, before?: string | null) =>
      [...queryKeys.walletActivity.all(), owner, limit, before ?? null] as const,
  },

  activityMintMeta: {
    all: () => ["activityMintMeta"] as const,
    byMints: (mints: string[]) =>
      [...queryKeys.activityMintMeta.all(), mints.join(",")] as const,
  },

  feeBalance: {
    all: () => ["feeBalance"] as const,
    byToken: (token: string | null) =>
      [...queryKeys.feeBalance.all(), token] as const,
  },

  verifiedTokens: {
    all: () => ["verifiedTokens"] as const,
  },

  walletPolicy: {
    all: () => ["walletPolicy"] as const,
    byToken: (token: string | null) =>
      [...queryKeys.walletPolicy.all(), token] as const,
  },

  walletPda: {
    all: () => ["walletPda"] as const,
    byToken: (token: string | null) =>
      [...queryKeys.walletPda.all(), token] as const,
  },

  tokenSession: {
    all: () => ["tokenSession"] as const,
    byToken: (token: string | null) =>
      [...queryKeys.tokenSession.all(), token] as const,
  },

  phygitalToken: {
    all: () => ["phygitalTokens"] as const,
    byIdentifier: (identifier: string | null) =>
      [...queryKeys.phygitalToken.all(), "identifier", identifier] as const,
    byAddress: (token: string | null) =>
      [...queryKeys.phygitalToken.all(), "address", token] as const,
  },
};
