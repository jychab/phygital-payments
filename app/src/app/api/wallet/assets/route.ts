import { withVaultQuery } from "@/lib/server/vault-route";
import { fetchWalletPortfolio } from "@/lib/server/wallet-assets";

export const runtime = "nodejs";

export async function GET(req: Request) {
  return withVaultQuery(req, async (vault) => {
    const portfolio = await fetchWalletPortfolio(vault);
    return { portfolio };
  });
}
