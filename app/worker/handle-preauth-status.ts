import {
  GRANT_NOT_FOUND,
  type PreauthStatusResult,
} from "../shared/preauth-status";
import {
  INVALID_API_KEY,
  REVOKED_API_KEY,
  parseApiKey,
} from "./api-key-hmac";

const NO_STORE = {
  "content-type": "application/json",
  "Cache-Control": "private, no-store",
} as const;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: NO_STORE,
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal error";
}

/** HMAC-parse apiKey, then block on the per-wallet DO until a terminal status. */
export async function handlePreauthStatus(
  request: Request,
  env: Pick<CloudflareEnv, "PAY_HMAC_SECRET" | "PREAUTH_GRANTS">,
): Promise<Response> {
  const url = new URL(request.url);
  const apiKey = url.searchParams.get("apiKey")?.trim() ?? "";
  const grantId = url.searchParams.get("grantId")?.trim() ?? "";

  if (!apiKey) {
    return json({ error: "Query param apiKey is required" }, 400);
  }
  if (!grantId) {
    return json({ error: "Query param grantId is required" }, 400);
  }

  const secret = env.PAY_HMAC_SECRET?.trim();
  if (!secret) {
    return json({ error: "PAY_HMAC_SECRET is not configured" }, 500);
  }

  try {
    const parsed = await parseApiKey(secret, apiKey);
    if (!parsed) {
      return json({ error: INVALID_API_KEY }, 401);
    }

    const ns = env.PREAUTH_GRANTS;
    if (!ns) {
      return json(
        { error: "PREAUTH_GRANTS Durable Object binding is not configured" },
        500,
      );
    }

    const result: PreauthStatusResult = await ns
      .get(ns.idFromName(parsed.wallet))
      .status({ grantId, gen: parsed.gen });

    return json(result, 200);
  } catch (error) {
    const message = errorMessage(error);
    if (message === INVALID_API_KEY || message === REVOKED_API_KEY) {
      return json({ error: message }, 401);
    }
    if (message === GRANT_NOT_FOUND) {
      return json({ error: message }, 404);
    }
    return json({ error: message }, 500);
  }
}
