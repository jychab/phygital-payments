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

/** Parse JSON and throw `body.error` when the response is not OK. */
export async function readJson<T>(
  res: Response,
  fallback: string,
): Promise<T> {
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(body.error ?? fallback);
  }
  return body;
}
