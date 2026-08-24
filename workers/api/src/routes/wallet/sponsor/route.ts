import type { Address, Instruction } from "@solana/kit";

import { withApiMetrics } from "@/lib/server/analytics";
import { apiJson } from "@/lib/server/api-response";
import {
  assertRateLimit,
  clientIp,
  rateLimitPresets,
  RateLimitError,
} from "@/lib/server/rate-limit";
import {
  assertSponsorBudget,
  SponsorBudgetError,
} from "@/lib/server/sponsor-budget";
import {
  requireWalletSession,
  walletSessionErrorMessage,
  WalletSessionError,
} from "@/lib/server/wallet-session";
import {
  assertSponsoredInstructionsForSession,
  isCreateWalletOnlyBatch,
  SponsorValidationError,
  validateSponsoredInstructions,
} from "@/lib/server/wallet-sponsor";
import {
  IdempotencyConflictError,
  idempotencyKey,
  readIdempotentResponse,
  requestFingerprint,
  storeIdempotentResponse,
} from "@/lib/server/idempotency";
import { getFeePayerAddress } from "@/lib/server/fee-payer";
import { SignerError, signerErrorToHttp } from "@/lib/signer/errors";
import { getSignerClient } from "@/lib/signer/get-signer-client";
import type { SponsorRequest } from "@/shared/sponsor-wire";
import { toUserErrorMessage } from "@/lib/user-errors";
import {
  buildSponsoredWireForExternalSign,
  fetchLatestBlockhash,
  submitSignedWire,
  type BlockhashLifetime,
  SubmitError,
} from "@/worker/solana";

async function signAndSubmit(
  instructions: Instruction[],
  latestBlockhash: BlockhashLifetime,
  feePayer: Address,
): Promise<string> {
  const unsignedWire = await buildSponsoredWireForExternalSign(
    instructions,
    latestBlockhash,
    feePayer,
  );
  const { transaction: signedWire } = await getSignerClient().signFeePayer({
    transaction: unsignedWire,
  });
  return String(await submitSignedWire(signedWire));
}

/** POST /api/wallet/sponsor — fee-payer signs an allowlisted instruction list. */
export async function POST(req: Request) {
  return withApiMetrics("/api/wallet/sponsor", async () => {
    try {
      const body = (await req.json()) as SponsorRequest;
      const idemKey = idempotencyKey(req);
      if (idemKey) {
        const cached = await readIdempotentResponse<{ signature: string }>(
          "/api/wallet/sponsor",
          idemKey,
        );
        if (cached) return apiJson(cached);
      }

      const wires = body?.instructions ?? [];
      const feePayer = await getFeePayerAddress();
      const instructions = validateSponsoredInstructions(wires, feePayer);

      let latestBlockhash: BlockhashLifetime;
      if (isCreateWalletOnlyBatch(instructions)) {
        [, latestBlockhash] = await Promise.all([
          assertRateLimit(
            `sponsor:create-wallet:${clientIp(req)}`,
            rateLimitPresets.createWallet,
          ),
          fetchLatestBlockhash(),
        ]);
      } else {
        const session = await requireWalletSession();
        assertSponsoredInstructionsForSession(wires, session);
        const vaultPda = String(session.vaultPda);
        [, , latestBlockhash] = await Promise.all([
          assertRateLimit(`sponsor:${vaultPda}`, rateLimitPresets.sponsor),
          assertSponsorBudget(vaultPda),
          fetchLatestBlockhash(),
        ]);
      }

      const signature = await signAndSubmit(
        instructions,
        latestBlockhash,
        feePayer,
      );
      const response = { signature };
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
