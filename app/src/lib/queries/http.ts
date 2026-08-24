function getApiOrigin(): string {
  const origin = process.env.NEXT_PUBLIC_API_ORIGIN?.trim().replace(/\/+$/, "");
  if (!origin) {
    throw new Error("NEXT_PUBLIC_API_ORIGIN is not configured");
  }
  return origin;
}

export function resolveApiUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input !== "string" || !input.startsWith("/api/")) {
    return input;
  }
  return new URL(input, `${getApiOrigin()}/`).toString();
}

/** Browser fetch for React Query — HTTP cache off; RQ owns freshness. */
export function queryFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return fetch(resolveApiUrl(input), {
    ...init,
    cache: "no-store",
    credentials: "include",
  });
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
