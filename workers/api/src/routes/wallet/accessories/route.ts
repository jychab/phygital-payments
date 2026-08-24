import { withApiMetrics } from "@/lib/server/analytics";
import { withVaultQuery } from "@/lib/server/vault-route";
import { listOwnedNfcAccessories } from "@/lib/server/nfc-accessories";

/** Controlled phygital tokens owned by the vault. */
export async function GET(req: Request) {
  return withApiMetrics("/api/wallet/accessories", async () => {
    return withVaultQuery(req, async (vault) => {
      const accessories = await listOwnedNfcAccessories(vault);
      return { accessories };
    });
  });
}
