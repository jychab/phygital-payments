const NO_STORE = { "Cache-Control": "private, no-store" } as const;

/**
 * CORS for public external-app routes (`/api/challenge`, `/api/modifyAndSign`).
 * Credentialed wallet/token routes rely on `withAppCors` in `index.ts` (APP_ORIGIN).
 * `withAppCors` leaves responses alone when `Access-Control-Allow-Origin` is already set.
 */
export const PUBLIC_CORS_HEADERS = {
  ...NO_STORE,
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key",
} as const;

export function apiJson(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
) {
  return Response.json(body, {
    status,
    headers: { ...NO_STORE, ...extraHeaders },
  });
}

/** HTTP Cache-Control only (no Workers Cache API). */
export function cachedApiJson(
  body: unknown,
  maxAgeSec: number,
  visibility: "private" | "public" = "private",
) {
  const swr = Math.max(1, Math.floor(maxAgeSec / 2));
  return Response.json(body, {
    status: 200,
    headers: {
      "Cache-Control": `${visibility}, max-age=${maxAgeSec}, stale-while-revalidate=${swr}`,
    },
  });
}

export function corsJson(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: PUBLIC_CORS_HEADERS,
  });
}

export function corsOptions(methods: string) {
  return new Response(null, {
    status: 204,
    headers: { ...PUBLIC_CORS_HEADERS, "Access-Control-Allow-Methods": methods },
  });
}
