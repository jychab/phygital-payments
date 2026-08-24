import { withApiMetrics } from "@/platform/analytics";
import { listVaultAgents } from "@/agent/list";
import { listOwnedNfcAccessories } from "@/phygital/accessories";
import { withVaultQuery } from "@/wallet/vault-query";
import { fetchWalletPortfolio } from "@/wallet/assets";

/**
 * Batch wallet home data: portfolio + NFC accessories + agents in one round trip.
 * Agents overlap D1/slot/GMA with accessory GPA; ownership reuses accessory passkeys.
 */
export async function GET(req: Request) {
  return withApiMetrics("/api/wallet/dashboard", async () => {
    return withVaultQuery(req, async (vault) => {
      const accessoriesPromise = listOwnedNfcAccessories(vault);
      const [portfolio, accessories, agents] = await Promise.all([
        fetchWalletPortfolio(vault),
        accessoriesPromise,
        listVaultAgents(vault, {
          ownedPasskeys: accessoriesPromise.then(
            (items) =>
              new Set(items.map((accessory) => accessory.secp256r1PublicKey)),
          ),
        }),
      ]);
      return { portfolio, accessories, agents };
    });
  });
}
