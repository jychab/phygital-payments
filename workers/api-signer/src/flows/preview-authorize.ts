import { assertFeeBalance } from "@/fees/fee-balance-gate";
import { authorizeIntent } from "@/verifier/approval";
import { assertPreviewWalletSigner } from "@/verifier/assert-preview-wallet";
import type {
  PreviewAuthorizeInput,
  PreviewAuthorizeResult,
} from "@/verifier/signer-service";

export type { PreviewAuthorizeInput, PreviewAuthorizeResult };

/**
 * Wallet PDA signer → authorize(preview) → fee only if authorize ok.
 * Authorize first so soft denies still reach pending-approvals without a fee RPC.
 * No signing.
 */
export async function previewAuthorize(
  input: PreviewAuthorizeInput,
): Promise<PreviewAuthorizeResult> {
  await assertPreviewWalletSigner(input.phygitalToken, input.instructions);

  const result = await authorizeIntent({
    phygitalToken: input.phygitalToken,
    instructions: input.instructions,
    mode: "preview",
  });

  if (!result.ok) {
    return {
      ok: false,
      intentHash: result.intentHash,
      code: result.code,
      error: result.error,
      soft: result.soft,
      details: result.details,
    };
  }

  const fee = await assertFeeBalance({
    phygitalToken: input.phygitalToken,
    instructions: input.instructions,
  });
  if (!fee.ok) {
    return {
      ok: false,
      code: fee.code,
      error: fee.error,
      soft: fee.soft,
      details: fee.details,
    };
  }

  return { ok: true, intentHash: result.intentHash };
}
