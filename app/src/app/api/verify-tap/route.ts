import { apiJson } from "@/lib/server/api-response";
import {
  evaluateCounter,
  TAP_SESSION_TTL_MS,
} from "@/lib/phygital/tap/counter-session";
import {
  readCounterSession,
  writeCounterSession,
} from "@/lib/phygital/tap/counter-store";
import { verifyDynamicUrlWithoutCounterCheck } from "@/lib/phygital/tap/verify-dynamic-url";
import { toUserErrorMessage } from "@/lib/user-errors";

/**
 * Verify an NFC dynamic-URL tap (`pk`/`s`/`c`/`n`) for Hold to Check.
 *
 * Signature check, then monotonic counter anti-replay against the shared
 * `revibase_counter` KV. A new counter (strictly greater than the stored max)
 * advances KV. The same counter may re-verify inside a short grace window
 * (page remount); after that it fails.
 */
export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    if (!["pk", "s", "c", "n"].every((k) => params.get(k))) {
      return apiJson(
        { isVerified: false, error: "Missing tap parameters" },
        400,
      );
    }

    const { isVerified, counter, secp256r1PublicKey } =
      verifyDynamicUrlWithoutCounterCheck(params);

    if (!isVerified) {
      return apiJson({ isVerified: false, error: "Invalid signature" }, 400);
    }

    const now = Date.now();
    const state = await readCounterSession(secp256r1PublicKey);
    const verdict = evaluateCounter(state, counter, now, TAP_SESSION_TTL_MS);

    if (verdict === "replay") {
      return apiJson(
        {
          isVerified: false,
          error: "This tap was already used. Hold your phygital to this phone again.",
        },
        409,
      );
    }

    if (verdict === "new") {
      await writeCounterSession(secp256r1PublicKey, { c: counter, t: now });
    }

    return apiJson({
      isVerified: true,
      secp256r1PublicKey,
      counter,
      reentry: verdict === "reentry",
    });
  } catch (err) {
    return apiJson(
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
