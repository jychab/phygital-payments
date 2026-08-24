import { withApiMetrics } from "@/platform/analytics";
import { cachedApiJson } from "@/platform/api-response";
import { withVaultQuery } from "@/wallet/vault-query";
import { fetchWalletPortfolio } from "@/wallet/assets";

const CACHE_TTL_SEC = 30;

export async function GET(req: Request) {
  return withApiMetrics("/api/wallet/assets", async () => {
    return withVaultQuery(req, async (vault) => {
      const portfolio = await fetchWalletPortfolio(vault);
      return cachedApiJson({ portfolio }, CACHE_TTL_SEC, "private");
    });
  });
}
