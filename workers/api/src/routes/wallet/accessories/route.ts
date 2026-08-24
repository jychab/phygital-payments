import { withApiMetrics } from "@/platform/analytics";
import { withVaultQuery } from "@/wallet/vault-query";
import { listOwnedNfcAccessories } from "@/phygital/accessories";

/** Controlled phygital tokens owned by the vault. */
export async function GET(req: Request) {
  return withApiMetrics("/api/wallet/accessories", async () => {
    return withVaultQuery(req, async (vault) => {
      const accessories = await listOwnedNfcAccessories(vault);
      return { accessories };
    });
  });
}
