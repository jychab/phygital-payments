/** Default upstream RPC / HTTP timeout for Worker fetch calls. */
export const UPSTREAM_TIMEOUT_MS = 8_000;

export function upstreamSignal(timeoutMs = UPSTREAM_TIMEOUT_MS): AbortSignal {
  return AbortSignal.timeout(timeoutMs);
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = UPSTREAM_TIMEOUT_MS,
): Promise<Response> {
  const signal = init?.signal ?? upstreamSignal(timeoutMs);
  return fetch(input, { ...init, signal });
}
