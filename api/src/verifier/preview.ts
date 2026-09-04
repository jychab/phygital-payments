/**
 * POST /preview — preflight before NFC / passkey (no co-sign).
 *
 * Soft deny may upsert `pending_approvals` when an owner exists and this
 * browser is not the owner (device session + link). Never upsert when unlinked.
 */
import { Hono } from "hono";

import { getLinkForToken } from "@/auth/device-db";
import { readDeviceSession } from "@/auth/device-session";
import { upsertPendingApproval } from "@/auth/pending-approvals-db";
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

    if (result.soft) {
      const ownerLink = await getLinkForToken(phygitalToken);
      if (ownerLink) {
        const session = await readDeviceSession(c);
        const isOwner =
          session != null && session.credentialId === ownerLink.credentialId;
        if (!isOwner) {
          await upsertPendingApproval({
            phygitalToken,
            intentHash: result.intentHash,
            code: result.code,
            error: result.error,
            details: result.details,
          });
        }
      }
      // unlinked → no upsert
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
