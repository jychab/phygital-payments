import { getSolanaRpc } from "@/lib/solana/rpc";
import { getFeePayerAddress } from "@/lib/server/fee-payer";

const LOW_BALANCE_LAMPORTS = 500_000_000n; // ~0.5 SOL runway warning

/** Log fee-payer balance for ops alerting (structured JSON via analytics caller). */
export async function checkFeePayerHealth() {
  try {
    const feePayer = await getFeePayerAddress();
    const lamports = (
      await getSolanaRpc()
        .getBalance(feePayer, { commitment: "confirmed" })
        .send()
    ).value;
    return {
      address: String(feePayer),
      lamports,
      lowBalance: lamports < LOW_BALANCE_LAMPORTS,
    };
  } catch (error) {
    console.error("[fee-payer-health]", error);
    return null;
  }
}
