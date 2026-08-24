import { withApiMetrics } from "@/platform/analytics";
import { apiJson, cachedApiJson } from "@/platform/api-response";
import { fetchDasCollectible } from "@/solana/das-collectible";
import { rateLimitOrResponse, rateLimitPresets } from "@/platform/rate-limit";
import { tryParseAddress } from "@/solana/address";
import { toUserErrorMessage } from "@/platform/user-errors";

const CACHE_TTL_SEC = 900;

export async function GET(req: Request) {
  return withApiMetrics("/api/tokens/collectible", async () => {
    const limited = await rateLimitOrResponse(req, rateLimitPresets.publicRead);
    if (limited) return limited;

    const idRaw = new URL(req.url).searchParams.get("id")?.trim() ?? "";
    const id = tryParseAddress(idRaw);
    if (!id) {
      return apiJson(
        { error: "Query param id must be a valid Solana address" },
        400,
      );
    }

    try {
      const collectible = await fetchDasCollectible(id);
      return cachedApiJson({ collectible }, CACHE_TTL_SEC, "public");
    } catch (error) {
      return apiJson(
        { error: toUserErrorMessage(error, "Failed to load collectible") },
        502,
      );
    }
  });
}
