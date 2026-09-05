/**
 * POST /preview — preflight before NFC / passkey (no co-sign).
 *
 * Soft deny may upsert `pending_approvals` when an owner exists and this
 * browser is not the owner (device session + link). Never upsert when unlinked.
 *
 * Authorize first so soft/hard denies skip the fee-gate RPC. Fee is checked
 * only when the standing policy (or unused grant) already allows.
 */
import { Hono } from "hono";

import { getLinkForToken } from "@/auth/device-db";
import { readDeviceSession } from "@/auth/device-session";
import { upsertPendingApproval } from "@/auth/pending-approvals-db";
import { assertFeeBalance } from "@/fees/fee-balance-gate";
import { json } from "@/shared/http";
import { assertPreviewWalletSigner } from "@/verifier/assert-preview-wallet";
import { authorizeIntent } from "@/verifier/approval";
import type { Instruction } from "phygital-verifier-sdk";
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

    const instructions: Instruction[] = body.instructions.map(
      instructionFromJson,
    );
    await assertPreviewWalletSigner(phygitalToken, instructions);

    const result = await authorizeIntent({
      phygitalToken,
      instructions,
      mode: "preview",
    });

    if (!result.ok) {
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
      }

      return json({
        ok: false,
        code: result.code,
        error: result.error,
        soft: result.soft,
        intentHash: result.intentHash,
        details: result.details,
      });
    }

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

    return json({ ok: true, intentHash: result.intentHash });
  } catch (err) {
    return verifierJsonError(err, "preview");
  }
});
