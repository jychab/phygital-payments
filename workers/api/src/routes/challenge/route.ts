import { withApiMetrics } from "@/platform/analytics";
import { corsJson, corsOptions } from "@/platform/api-response";
import { rateLimitOrResponse, rateLimitPresets } from "@/platform/rate-limit";
import { SignerError, signerErrorToHttp } from "@/signer/errors";
import { getSignerClient } from "@/signer/get-signer-client";
import { toUserErrorMessage } from "@/platform/user-errors";

function originFromRequest(req: Request): string {
  return (req.headers.get("origin") ?? "Unknown app").slice(0, 200);
}

export function OPTIONS() {
  return corsOptions("GET, OPTIONS");
}

/** GET /api/challenge — mint a challenge (Origin header stored if present). */
export async function GET(req: Request) {
  return withApiMetrics("/api/challenge", async () => {
    const limited = await rateLimitOrResponse(
      req,
      rateLimitPresets.publicWrite,
      undefined,
      { publicCors: true },
    );
    if (limited) return limited;

    try {
      const signer = getSignerClient();
      return corsJson(await signer.createChallenge(originFromRequest(req)));
    } catch (error) {
      if (error instanceof SignerError) {
        const mapped = signerErrorToHttp(error);
        return corsJson({ error: mapped.message }, mapped.status);
      }
      return corsJson({ error: toUserErrorMessage(error, "Couldn’t start") }, 500);
    }
  });
}
