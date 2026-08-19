/** Default Cache-Control for API routes consumed by React Query. */
export const QUERY_NO_STORE = {
  "Cache-Control": "private, no-store",
} as const;

/**
 * Browser fetch for React Query (and other app API calls).
 * HTTP cache is off — React Query owns freshness.
 */
export function queryFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, { ...init, cache: "no-store" });
}
