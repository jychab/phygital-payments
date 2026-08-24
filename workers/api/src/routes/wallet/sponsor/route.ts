import type { Address, Instruction } from "@solana/kit";

import { withApiMetrics } from "@/platform/analytics";
import { apiJson } from "@/platform/api-response";
import {
  assertRateLimit,
  clientIp,
  rateLimitPresets,
  RateLimitError,
} from "@/platform/rate-limit";
import {
  assertSponsorBudget,
  SponsorBudgetError,
} from "@/sponsor/budget";
import {
  requireWalletSession,
  walletSessionErrorMessage,
  WalletSessionError,
} from "@/wallet/session";
import {
  assertSponsoredInstructionsForSession,
  isCreateWalletOnlyBatch,
  SponsorValidationError,
  validateSponsoredInstructions,
} from "@/sponsor/validate";
import {
  IdempotencyConflictError,
  idempotencyKey,
  readIdempotentResponse,
  requestFingerprint,
  storeIdempotentResponse,
} from "@/platform/idempotency";
import { getFeePayerAddress } from "@/sponsor/fee-payer";
import { SignerError, signerErrorToHttp } from "@/signer/errors";
import { getSignerClient } from "@/signer/get-signer-client";
import type { SponsorRequest, SponsorResponse } from "@/shared/sponsor-wire";
import { toUserErrorMessage } from "@/platform/user-errors";
import {
  buildSponsoredWireForExternalSign,
  estimateSponsoredComputeUnits,
  fetchLatestBlockhash,
  submitSignedWire,
  type BlockhashLifetime,
  SubmitError,
} from "@/sponsor/submit";

async function signAndSubmit(
  instructions: Instruction[],
  latestBlockhash: BlockhashLifetime,
  feePayer: Address,
  computeUnitLimit: number,
): Promise<SponsorResponse> {
  const unsignedWire = await buildSponsoredWireForExternalSign(
    instructions,
    latestBlockhash,
    feePayer,
    computeUnitLimit,
  );
  const { transaction: signedWire } = await getSignerClient().signFeePayer({
    transaction: unsignedWire,
  });
  const signature = String(await submitSignedWire(signedWire));
  return {
    signature,
    lastValidBlockHeight: Number(latestBlockhash.lastValidBlockHeight),
  };
}

/** POST /api/wallet/sponsor — fee-payer signs an allowlisted instruction list. */
export async function POST(req: Request) {
  return withApiMetrics("/api/wallet/sponsor", async () => {
    try {
      const body = (await req.json()) as SponsorRequest;
      const idemKey = idempotencyKey(req);
      const feePayerPromise = getFeePayerAddress();
      if (idemKey) {
        const cached = await readIdempotentResponse<SponsorResponse>(
          "/api/wallet/sponsor",
          idemKey,
        );
        if (cached) return apiJson(cached);
      }

      const wires = body?.instructions ?? [];
      const feePayer = await feePayerPromise;
      const instructions = validateSponsoredInstructions(wires, feePayer);

      let latestBlockhash: BlockhashLifetime;
      let computeUnitLimit: number;
      if (isCreateWalletOnlyBatch(instructions)) {
        [, latestBlockhash, computeUnitLimit] = await Promise.all([
          assertRateLimit(
            `sponsor:create-wallet:${clientIp(req)}`,
            rateLimitPresets.createWallet,
          ),
          fetchLatestBlockhash(),
          estimateSponsoredComputeUnits(instructions, feePayer),
        ]);
      } else {
        const [session, blockhash] = await Promise.all([
          requireWalletSession(),
          fetchLatestBlockhash(),
        ]);
        assertSponsoredInstructionsForSession(wires, session);
        const vaultPda = String(session.vaultPda);
        [, , computeUnitLimit] = await Promise.all([
          assertRateLimit(`sponsor:${vaultPda}`, rateLimitPresets.sponsor),
          assertSponsorBudget(vaultPda),
          estimateSponsoredComputeUnits(instructions, feePayer),
        ]);
        latestBlockhash = blockhash;
      }

      const response = await signAndSubmit(
        instructions,
        latestBlockhash,
        feePayer,
        computeUnitLimit,
      );
      if (idemKey) {
        await storeIdempotentResponse(
          "/api/wallet/sponsor",
          idemKey,
          requestFingerprint(body),
          response,
        );
      }
      return apiJson(response);
    } catch (error) {
      if (error instanceof IdempotencyConflictError) {
        return apiJson({ error: error.message }, 409);
      }
      if (error instanceof RateLimitError) {
        return apiJson({ error: "Too many requests. Try again shortly." }, 429);
      }
      if (error instanceof SponsorBudgetError) {
        return apiJson({ error: error.message }, 429);
      }
      if (error instanceof WalletSessionError) {
        return apiJson({ error: walletSessionErrorMessage(error) }, 401);
      }
      if (error instanceof SponsorValidationError) {
        return apiJson({ error: error.message }, 400);
      }
      if (error instanceof SignerError) {
        const mapped = signerErrorToHttp(error);
        return apiJson({ error: mapped.message }, mapped.status);
      }
      if (error instanceof SubmitError) {
        return apiJson({ error: error.message }, error.transient ? 503 : 400);
      }
      return apiJson(
        { error: toUserErrorMessage(error, "Couldn’t submit") },
        500,
      );
    }
  });
}
