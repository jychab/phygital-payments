import { withApiMetrics } from "@/lib/server/analytics";
import { cachedApiJson } from "@/lib/server/api-response";
import { withVaultQuery } from "@/lib/server/vault-route";
import { fetchWalletPortfolio } from "@/lib/server/wallet-assets";

const CACHE_TTL_SEC = 30;

export async function GET(req: Request) {
  return withApiMetrics("/api/wallet/assets", async () => {
    return withVaultQuery(req, async (vault) => {
      const { dasPageCount: _pages, ...portfolio } =
        await fetchWalletPortfolio(vault);
      return cachedApiJson({ portfolio }, CACHE_TTL_SEC, "private");
    });
  });
}
