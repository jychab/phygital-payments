import { Hono } from "hono";

import { json } from "@/shared/http";
import {
  evaluateCounter,
  TAP_SESSION_TTL_MS,
} from "@/tap/counter-session";
import {
  readCounterSession,
  writeCounterSession,
} from "@/tap/counter-store";
import { verifyDynamicUrlWithoutCounterCheck } from "@/tap/verify-dynamic-url";
import { resolveTokenFromPasskeyPubkey } from "@/auth/passkey-verify";
import {
  mintSessionToken,
  setSessionCookie,
} from "@/auth/token-session";

function toUserErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message.trim()) {
    const msg = err.message.trim();
    if (
      msg.length < 140 &&
      !/[_\-]{2,}|\b(sysvar|u64|PDA|ATA|RPC|D1|KV)\b/i.test(msg)
    ) {
      return msg;
    }
  }
  return fallback;
}

export const verifyTapRoutes = new Hono();

verifyTapRoutes.get("/verify-tap", async (c) => {
  try {
    const params = new URL(c.req.url).searchParams;
    if (!["pk", "s", "c", "n"].every((k) => params.get(k))) {
      return json(
        { isVerified: false, error: "Missing tap parameters" },
        { status: 400 },
      );
    }

    const { isVerified, counter, secp256r1PublicKey } =
      verifyDynamicUrlWithoutCounterCheck(params);

    if (!isVerified) {
      return json({ isVerified: false, error: "Invalid signature" }, { status: 400 });
    }

    const now = Date.now();
    const state = await readCounterSession(secp256r1PublicKey);
    const verdict = evaluateCounter(state, counter, now, TAP_SESSION_TTL_MS);

    if (verdict === "replay") {
      return json(
        {
          isVerified: false,
          error: "This tap timed out. Hold your item here again to verify.",
        },
        { status: 409 },
      );
    }

    if (verdict === "new") {
      await writeCounterSession(secp256r1PublicKey, { c: counter, t: now });
    }

    let expiresAt: number | undefined;
    try {
      const phygitalToken =
        await resolveTokenFromPasskeyPubkey(secp256r1PublicKey);
      if (phygitalToken) {
        const minted = await mintSessionToken({
          phygitalToken,
          secp256r1PublicKey,
        });
        setSessionCookie(c, minted.token, minted.expiresAt);
        expiresAt = minted.expiresAt;
      }
    } catch {
      /* session mint is best-effort on verify-tap */
    }

    return json({
      isVerified: true,
      secp256r1PublicKey,
      counter,
      reentry: verdict === "reentry",
      ...(expiresAt != null ? { expiresAt } : {}),
    });
  } catch (err) {
    return json(
      {
        isVerified: false,
        error: toUserErrorMessage(
          err,
          "Hold flat against the back of your phone and try again.",
        ),
      },
      { status: 400 },
    );
  }
});
