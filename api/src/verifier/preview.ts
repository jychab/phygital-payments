/**
 * POST /preview — preflight before NFC / passkey (no co-sign).
 *
 * 1. Parse instructions
 * 2. Require wallet PDA as a signer on the intent
 * 3. Fee balance gate (default verifier paymaster)
 * 4. `authorizeIntent` (swap in `authorize.ts` / `approval/`)
 */
import { Hono } from "hono";

import { assertFeeBalance } from "@/fees/fee-balance-gate";
import { json } from "@/shared/http";
import { assertPreviewWalletSigner } from "@/verifier/assert-preview-wallet";
import { authorizeIntent } from "@/verifier/authorize";
import type { IntentInstruction } from "@/verifier/constants";
import { instructionFromJson } from "@/verifier/decode-tx";
import { verifierJsonError } from "@/verifier/errors";

export const previewRoutes = new Hono();

previewRoutes.post("/preview", async (c) => {
  try {
    const body = (await c.req.json()) as {
      phygitalToken?: string;
      instructions?: {
        programAddress: string;
        accounts?: { address: string; role?: string | number }[];
        data?: string;
      }[];
    };

    const phygitalToken = body.phygitalToken?.trim();
    if (!phygitalToken || !Array.isArray(body.instructions)) {
      return json(
        {
          ok: false,
          code: "invalid_transaction",
          error: "phygitalToken and instructions are required",
          soft: false,
        },
        { status: 400 },
      );
    }

    const instructions: IntentInstruction[] = body.instructions.map(
      instructionFromJson,
    );
    await assertPreviewWalletSigner(phygitalToken, instructions);

    const fee = await assertFeeBalance({ phygitalToken, instructions });
    if (!fee.ok) {
      return json({
        ok: false,
        code: fee.code,
        error: fee.error,
        soft: fee.soft,
        details: fee.details,
      });
    }

    const result = await authorizeIntent({
      phygitalToken,
      instructions,
      mode: "preview",
    });

    if (result.ok) {
      return json({ ok: true, intentHash: result.intentHash });
    }

    return json({
      ok: false,
      code: result.code,
      error: result.error,
      soft: result.soft,
      intentHash: result.intentHash,
      details: result.details,
    });
  } catch (err) {
    return verifierJsonError(err, "preview");
  }
});
