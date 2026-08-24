import { withApiMetrics } from "@/platform/analytics";
import { apiJson } from "@/platform/api-response";
import { getFeePayerAddress } from "@/sponsor/fee-payer";
import { SignerError, signerErrorToHttp } from "@/signer/errors";
import { toUserErrorMessage } from "@/platform/user-errors";

/** GET /api/wallet/fee-payer — active sponsored fee-payer pubkey from the signer. */
export async function GET() {
  return withApiMetrics("/api/wallet/fee-payer", async () => {
    try {
      const feePayer = await getFeePayerAddress();
      return apiJson({ publicKey: String(feePayer) });
    } catch (error) {
      if (error instanceof SignerError) {
        const mapped = signerErrorToHttp(error);
        return apiJson({ error: mapped.message }, mapped.status);
      }
      return apiJson(
        { error: toUserErrorMessage(error, "Fee payer not available") },
        503,
      );
    }
  });
}
