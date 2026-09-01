import { NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import {
  evaluateCounter,
  TAP_SESSION_TTL_MS,
} from "@/lib/token/tap/counter-session";
import {
  readCounterSession,
  writeCounterSession,
} from "@/lib/token/tap/counter-store";
import { verifyDynamicUrlWithoutCounterCheck } from "@/lib/token/tap/verify-dynamic-url";
import { toUserErrorMessage } from "@/lib/user-errors";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: QUERY_NO_STORE });
}

/**
 * Verify an NFC dynamic-URL tap (`pk`/`s`/`c`/`n`) for Enable Pay.
 *
 * Signature check, then monotonic counter anti-replay against the shared
 * `revibase_counter` KV (same store as vault / developer). A new counter
 * (strictly greater than the stored max) advances KV. The same counter may
 * re-verify inside a short grace window (page remount); after that it fails.
 */
export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    if (!["pk", "s", "c", "n"].every((k) => params.get(k))) {
      return json(
        { isVerified: false, error: "Missing tap parameters" },
        400,
      );
    }

    const { isVerified, counter, secp256r1PublicKey } =
      verifyDynamicUrlWithoutCounterCheck(params);

    if (!isVerified) {
      return json({ isVerified: false, error: "Invalid signature" }, 400);
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
        409,
      );
    }

    if (verdict === "new") {
      await writeCounterSession(secp256r1PublicKey, { c: counter, t: now });
    }

    return json({
      isVerified: true,
      secp256r1PublicKey,
      counter,
      reentry: verdict === "reentry",
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
      400,
    );
  }
}
