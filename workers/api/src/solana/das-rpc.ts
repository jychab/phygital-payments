import { getRpcUrl } from "@/solana/cluster";
import { fetchWithTimeout } from "@/platform/fetch-with-timeout";

type DasJsonRpcBody<T> = {
  result?: T;
  error?: { message?: string };
};

/**
 * Helius DAS JSON-RPC POST. Throws on HTTP or JSON-RPC errors.
 * Isolate/HTTP caching is the caller's job.
 */
export async function postDasRpc<T>(args: {
  method: string;
  params: unknown;
  id: string;
}): Promise<T | undefined> {
  const res = await fetchWithTimeout(getRpcUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: args.id,
      method: args.method,
      params: args.params,
    }),
  });

  if (!res.ok) {
    throw new Error(`${args.method} RPC failed (${res.status})`);
  }

  const body = (await res.json()) as DasJsonRpcBody<T>;
  if (body.error?.message) {
    throw new Error(body.error.message);
  }
  return body.result;
}
