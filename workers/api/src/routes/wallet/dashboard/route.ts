import { withApiMetrics } from "@/lib/server/analytics";
import { listVaultAgents } from "@/lib/server/list-vault-agents";
import { listOwnedNfcAccessories } from "@/lib/server/nfc-accessories";
import { withVaultQuery } from "@/lib/server/vault-route";
import { fetchWalletPortfolio } from "@/lib/server/wallet-assets";

/**
 * Batch wallet home data: portfolio + NFC accessories + agents in one round trip.
 * Agents overlap D1/slot/GMA with accessory GPA; ownership reuses accessory passkeys.
 */
export async function GET(req: Request) {
  return withApiMetrics("/api/wallet/dashboard", async () => {
    return withVaultQuery(req, async (vault) => {
      const accessoriesPromise = listOwnedNfcAccessories(vault);
      const [portfolioResult, accessories, agents] = await Promise.all([
        fetchWalletPortfolio(vault),
        accessoriesPromise,
        listVaultAgents(vault, {
          ownedPasskeys: accessoriesPromise.then(
            (items) =>
              new Set(items.map((accessory) => accessory.secp256r1PublicKey)),
          ),
        }),
      ]);
      const { dasPageCount: _pages, ...portfolio } = portfolioResult;
      return { portfolio, accessories, agents };
    });
  });
}
