import { withApiMetrics } from "@/lib/server/analytics";
import { corsJson, corsOptions } from "@/lib/server/api-response";
import { rateLimitOrResponse, rateLimitPresets } from "@/lib/server/rate-limit";
import { SignerError, signerErrorToHttp } from "@/lib/signer/errors";
import { getSignerClient } from "@/lib/signer/get-signer-client";
import { toUserErrorMessage } from "@/lib/user-errors";

export function OPTIONS() {
  return corsOptions("GET, POST, OPTIONS");
}

export async function GET(req: Request) {
  return withApiMetrics("/api/challenge", async () => {
    const limited = await rateLimitOrResponse(req, rateLimitPresets.publicRead, undefined, {
      publicCors: true,
    });
    if (limited) return limited;

    const requestId = new URL(req.url).searchParams.get("requestId");
    if (!requestId) return corsJson({ error: "Missing request" }, 400);

    try {
      const signer = getSignerClient();
      const status = await signer.getChallenge(requestId);
      return corsJson(status);
    } catch (error) {
      if (error instanceof SignerError) {
        const mapped = signerErrorToHttp(error);
        return corsJson({ error: mapped.message }, mapped.status);
      }
      return corsJson({ error: toUserErrorMessage(error, "Couldn’t load") }, 500);
    }
  });
}

export async function POST(req: Request) {
  return withApiMetrics("/api/challenge", async () => {
    const limited = await rateLimitOrResponse(req, rateLimitPresets.publicWrite, undefined, {
      publicCors: true,
    });
    if (limited) return limited;

    try {
      const body = (await req.json().catch(() => ({}))) as { origin?: string };
      const origin = (
        body.origin ??
        req.headers.get("origin") ??
        "Unknown app"
      ).slice(0, 200);
      const signer = getSignerClient();
      const created = await signer.createChallenge(origin);
      return corsJson(created);
    } catch (error) {
      if (error instanceof SignerError) {
        const mapped = signerErrorToHttp(error);
        return corsJson({ error: mapped.message }, mapped.status);
      }
      return corsJson({ error: toUserErrorMessage(error, "Couldn’t start") }, 500);
    }
  });
}
