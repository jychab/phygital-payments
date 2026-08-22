import { bytesToBase64Url } from "@/lib/crypto/base64";
import { CHALLENGE_KV_TTL_SEC, CHALLENGE_TTL_MS } from "@/lib/server/agent-policy";
import {
  getChallenge,
  putChallenge,
  type NfcChallenge,
} from "@/lib/server/agent-store";
import { corsJson, corsOptions } from "@/lib/server/api-response";
import { toUserErrorMessage } from "@/lib/user-errors";

export const runtime = "nodejs";

/** Mint an NFC challenge. POST creates a one-time server-side nonce. */

export function OPTIONS() {
  return corsOptions("GET, POST, OPTIONS");
}

export async function GET(req: Request) {
  const requestId = new URL(req.url).searchParams.get("requestId");
  if (!requestId) return corsJson({ error: "Missing request" }, 400);
  const stored = await getChallenge(requestId);
  if (!stored || stored.consumed) {
    return corsJson({ error: "This request expired." }, 410);
  }
  if (Date.now() >= stored.expiresAtMs) {
    return corsJson({ error: "This request expired." }, 410);
  }
  return corsJson({
    requestId: stored.requestId,
    challenge: stored.challenge,
    expiresAtMs: stored.expiresAtMs,
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { origin?: string };
    const origin = (
      body.origin ??
      req.headers.get("origin") ??
      "Unknown app"
    ).slice(0, 200);
    const requestId = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16)));
    const nfcChallenge = crypto.randomUUID();
    const now = Date.now();
    const stored: NfcChallenge = {
      requestId,
      challenge: nfcChallenge,
      origin,
      createdAtMs: now,
      expiresAtMs: now + CHALLENGE_TTL_MS,
      consumed: false,
    };
    await putChallenge(stored, CHALLENGE_KV_TTL_SEC);
    return corsJson({
      requestId,
      challenge: nfcChallenge,
      expiresAtMs: stored.expiresAtMs,
    });
  } catch (error) {
    return corsJson({ error: toUserErrorMessage(error, "Couldn’t start") }, 500);
  }
}
