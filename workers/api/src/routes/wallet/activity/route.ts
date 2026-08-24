import { withApiMetrics } from "@/lib/server/analytics";
import { cachedApiJson } from "@/lib/server/api-response";
import { withVaultQuery } from "@/lib/server/vault-route";
import { fetchWalletActivity } from "@/lib/server/wallet-activity";

const CACHE_TTL_SEC = 15;

export async function GET(req: Request) {
  return withApiMetrics("/api/wallet/activity", async () => {
    return withVaultQuery(req, async (vault) => {
      const limitRaw = new URL(req.url).searchParams.get("limit");
      const limit = Math.min(40, Math.max(1, Number(limitRaw) || 20));
      const activity = await fetchWalletActivity(vault, limit);
      return cachedApiJson({ activity }, CACHE_TTL_SEC, "private");
    });
  });
}
