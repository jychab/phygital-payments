/**
 * POST /sign — authorize + ed25519 co-sign of wallet `execute` message bytes.
 *
 * 1. Decode base64 wire tx → execute metas + body instructions
 * 2. Fee balance gate (re-check, same as /preview)
 * 3. `authorizeIntent` (swap in `authorize.ts` / `approval/`)
 * 4. Assert execute.verifier matches this worker's key
 * 5. Sign message bytes → `{ signatures }`
 */
import { Hono } from "hono";

import { assertFeeBalance } from "@/fees/fee-balance-gate";
import { json } from "@/shared/http";
import { authorizeIntent } from "@/verifier/authorize";
import {
  assertExecuteVerifierMatchesKey,
  signMessageBase64,
} from "@/verifier/cosign";
import { decodeWireTransaction } from "@/verifier/decode-tx";
import { verifierJsonError } from "@/verifier/errors";

export const signRoutes = new Hono();

signRoutes.post("/sign", async (c) => {
  try {
    const body = (await c.req.json()) as { transactions?: string[] };
    if (!Array.isArray(body.transactions) || body.transactions.length === 0) {
      return json(
        { error: "transactions required", code: "invalid_transaction" },
        { status: 400 },
      );
    }

    const signatures: string[] = [];

    for (const wire of body.transactions) {
      const decoded = decodeWireTransaction(wire);

      const fee = await assertFeeBalance({
        phygitalToken: decoded.phygitalToken,
        instructions: decoded.instructions,
      });
      if (!fee.ok) {
        return json(
          {
            error: fee.error,
            code: fee.code,
            soft: fee.soft,
            details: {
              ...fee.details,
              phygitalToken: decoded.phygitalToken,
            },
          },
          { status: 403 },
        );
      }

      const result = await authorizeIntent({
        phygitalToken: decoded.phygitalToken,
        instructions: decoded.instructions,
        mode: "sign",
      });

      if (!result.ok) {
        return json(
          {
            error: result.error,
            code: result.code,
            soft: result.soft,
            details: {
              ...result.details,
              phygitalToken: decoded.phygitalToken,
              intentHash: result.intentHash,
            },
          },
          { status: 403 },
        );
      }

      assertExecuteVerifierMatchesKey(decoded.verifier);
      signatures.push(signMessageBase64(decoded.messageBytes));
    }

    return json({ signatures });
  } catch (err) {
    return verifierJsonError(err, "sign");
  }
});
