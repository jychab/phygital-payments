import { getCloudflareContext } from "@opennextjs/cloudflare";

import { apiJson } from "@/lib/server/api-response";
import {
  SponsorValidationError,
  validateSponsoredInstructions,
} from "@/lib/server/wallet-sponsor";
import { toUserErrorMessage } from "@/lib/user-errors";
import type { SponsorRequest } from "../../../../../shared/sponsor-wire";
import {
  assertFeePayerConfigured,
  fetchLatestBlockhash,
  getFeePayerSigner,
  sendSponsoredInstructions,
  SubmitError,
} from "../../../../../worker/solana";

export const runtime = "nodejs";

/** POST /api/wallet/sponsor — fee-payer signs an allowlisted instruction list. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SponsorRequest;
    const env = getCloudflareContext().env;
    const feePayer = assertFeePayerConfigured(env);
    const instructions = validateSponsoredInstructions(
      body?.instructions ?? [],
      feePayer,
    );
    const signer = await getFeePayerSigner(env);
    const latestBlockhash = await fetchLatestBlockhash(env);
    const signature = await sendSponsoredInstructions(
      env,
      instructions,
      { signer, latestBlockhash },
      { confirm: false },
    );
    return apiJson({ signature });
  } catch (error) {
    if (error instanceof SponsorValidationError) {
      return apiJson({ error: error.message }, 400);
    }
    if (error instanceof SubmitError) {
      return apiJson({ error: error.message }, error.transient ? 503 : 400);
    }
    return apiJson({ error: toUserErrorMessage(error, "Couldn’t submit") }, 500);
  }
}
