/**
 * React Query keys, fetchers, and staleTime presets.
 *
 * Browser HTTP always goes through `queryFetch` (`cache: "no-store"`).
 * React Query is the only client cache.
 */

export { shouldRetryQuery } from "./http";
export { queryKeys } from "./keys";
export {
  applyWalletPolicyPatch,
  invalidatePhygitalToken,
  invalidateRpcDependentQueries,
  invalidateWalletBalances,
} from "./mutations";

const SECOND = 1000;
const MINUTE = 60 * SECOND;

export const queryOptions = {
  /**
   * Ownership / token accounts that change in another browser (wallet IAB)
   * or via an NFC tap that cannot invalidate this tab's cache. Persist may
   * paint instantly; always refetch on mount/focus/reconnect.
   */
  volatile: {
    staleTime: 0,
    refetchOnMount: "always" as const,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  /** Changes after user actions; mutations already invalidate. */
  default: { refetchOnWindowFocus: false, staleTime: 5 * MINUTE },
  /** Catalog / rarely changing metadata. */
  stable: { refetchOnWindowFocus: false, staleTime: 15 * MINUTE },
  /** One-shot proofs / immutable chain metadata — never refetch. */
  immutable: {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: Infinity,
  },
} as const;
