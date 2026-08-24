import { withApiMetrics } from "@/platform/analytics";
import { apiJson } from "@/platform/api-response";
import {
  evaluateCounter,
  TAP_SESSION_TTL_MS,
} from "@/phygital/tap/counter-session";
import {
  readCounterSession,
  writeCounterSession,
} from "@/phygital/tap/counter-store";
import { verifyDynamicUrlWithoutCounterCheck } from "@/phygital/tap/verify-dynamic-url";
import { tryAdvanceD1Counter } from "@/phygital/tap/counter-d1";
import { rateLimitOrResponse, rateLimitPresets } from "@/platform/rate-limit";
import { toUserErrorMessage } from "@/platform/user-errors";

/**
 * Verify an NFC dynamic-URL tap (`pk`/`s`/`c`/`n`) for Hold to Check.
 */
export async function GET(req: Request) {
  return withApiMetrics("/api/verify-tap", async () => {
    const limited = await rateLimitOrResponse(req, rateLimitPresets.publicRead);
    if (limited) return limited;

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
            error:
              "This tap was already used. Hold your accessory to this phone again.",
          },
          409,
        );
      }

      if (verdict === "new") {
        const advanced = await tryAdvanceD1Counter(
          secp256r1PublicKey,
          counter,
          now,
        );
        if (!advanced) {
          return apiJson(
            {
              isVerified: false,
              error:
                "This tap was already used. Hold your accessory to this phone again.",
            },
            409,
          );
        }
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
  });
}
