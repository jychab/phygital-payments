import { AsyncLocalStorage } from "node:async_hooks";

type RequestContext = {
  env: CloudflareEnv;
  request: Request;
  ctx: ExecutionContext;
};

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(
  context: RequestContext,
  fn: () => Promise<T> | T,
): Promise<T> | T {
  return requestContextStorage.run(context, fn);
}

export function getRequestContext(): RequestContext {
  const context = requestContextStorage.getStore();
  if (!context) {
    throw new Error("Request context is not available");
  }
  return context;
}

export function getRequest(): Request {
  return getRequestContext().request;
}

export function getEnv(): CloudflareEnv {
  return getRequestContext().env;
}

export function getCookie(name: string): string | null {
  const cookieHeader = getRequest().headers.get("cookie");
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...valueParts] = part.trim().split("=");
    if (rawName !== name) continue;
    return valueParts.join("=") || "";
  }
  return null;
}

export function withSetCookie(response: Response, cookie: string): Response {
  const headers = new Headers(response.headers);
  headers.append("set-cookie", cookie);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
