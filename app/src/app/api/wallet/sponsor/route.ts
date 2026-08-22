import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import { getErrorMessage } from "@/lib/utils";
import {
  SponsorValidationError,
  validateSponsoredInstructions,
} from "@/lib/server/wallet-sponsor";
import type { SponsorRequest } from "../../../../../shared/sponsor-wire";
import {
  assertFeePayerConfigured,
  fetchLatestBlockhash,
  getFeePayerSigner,
  sendSponsoredInstructions,
  SubmitError,
} from "../../../../../worker/solana";

export const runtime = "nodejs";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: QUERY_NO_STORE });
}

/** POST /api/wallet/sponsor — fee-payer signs an allowlisted instruction list. */
export async function POST(req: NextRequest) {
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
    const signature = await sendSponsoredInstructions(env, instructions, {
      signer,
      latestBlockhash,
    });
    return json({ signature });
  } catch (error) {
    if (error instanceof SponsorValidationError) {
      return json({ error: error.message }, 400);
    }
    if (error instanceof SubmitError) {
      return json({ error: error.message }, error.transient ? 503 : 400);
    }
    return json({ error: getErrorMessage(error, "Internal error") }, 500);
  }
}
