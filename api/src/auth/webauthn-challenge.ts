import { getEnv } from "@/shared/request-context";
import { bytesToBase64Url } from "@/shared/crypto/base64";

const CHALLENGE_TTL_SEC = 300;
const CHALLENGE_PREFIX = "webauthn:challenge:";

function kv() {
  return getEnv().revibase_counter;
}

export async function storeWebAuthnChallenge(
  kind: "register" | "auth",
  phygitalToken: string,
  challenge: string,
): Promise<void> {
  await kv().put(`${CHALLENGE_PREFIX}${kind}:${phygitalToken}`, challenge, {
    expirationTtl: CHALLENGE_TTL_SEC,
  });
}

export async function consumeWebAuthnChallenge(
  kind: "register" | "auth",
  phygitalToken: string,
  expected: string,
): Promise<boolean> {
  const key = `${CHALLENGE_PREFIX}${kind}:${phygitalToken}`;
  const stored = await kv().get(key);
  if (!stored || stored !== expected) return false;
  await kv().delete(key);
  return true;
}

export function newWebAuthnChallenge(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToBase64Url(bytes);
}

/** RP ID for platform passkeys — registrable domain of the app origin. */
export function resolveWebAuthnRp(originHeader: string | null): {
  rpId: string;
  rpName: string;
  expectedOrigin: string;
} | null {
  if (!originHeader) return null;
  try {
    const url = new URL(originHeader);
    const host = url.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return {
        rpId: host,
        rpName: "Revibase",
        expectedOrigin: originHeader,
      };
    }
    if (host === "revibase.com" || host.endsWith(".revibase.com")) {
      return {
        rpId: "revibase.com",
        rpName: "Revibase",
        expectedOrigin: originHeader,
      };
    }
  } catch {
    return null;
  }
  return null;
}
