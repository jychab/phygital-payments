import { sweepOrphanedAgentSessions } from "@/agent/session-sweeper";
import { sweepExpiredChallenges } from "@/wallet/challenge-sweeper";
import { sweepIdempotencyKeys } from "./idempotency";
import { checkFeePayerHealth } from "@/sponsor/fee-payer-health";
import { sweepRateLimitBuckets } from "./rate-limit";
import { sweepSponsorBudget } from "@/sponsor/budget";
import { sweepWalletSessionRevocations } from "@/wallet/session-revocation";

/** Cron handler: D1 maintenance (challenges, rate limits, sponsor budget). */
export async function runScheduledTasks(_env: CloudflareEnv): Promise<void> {
  const [, , , , , , feePayer] = await Promise.all([
    sweepExpiredChallenges(Date.now()),
    sweepRateLimitBuckets(3_600_000),
    sweepSponsorBudget(),
    sweepIdempotencyKeys(Date.now()),
    sweepWalletSessionRevocations(Date.now() - 8 * 24 * 60 * 60 * 1000),
    sweepOrphanedAgentSessions(),
    checkFeePayerHealth(),
  ]);
  if (feePayer?.lowBalance) {
    console.log(
      JSON.stringify({
        ts: Date.now(),
        type: "fee_payer_low_balance",
        address: feePayer.address,
        lamports: String(feePayer.lamports),
      }),
    );
  }
}
