/** Absolute API origin for browser calls (no trailing slash). */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  // Local default when `pnpm --filter api dev` runs on 8787.
  if (process.env.NODE_ENV !== "production") {
    return "http://127.0.0.1:8787";
  }
  return "https://api.revibase.com";
}

/** Prefix a relative API path with the API Worker origin. */
export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = getApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
