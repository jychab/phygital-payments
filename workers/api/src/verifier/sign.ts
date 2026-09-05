/**
 * POST /sign — proxy to private verifier signer Worker (service binding).
 *
 * Sensitive work (fee, authorizeIntent, ed25519 co-sign) runs only in
 * revibase-verifier-signer; this Worker never holds verifier secrets.
 */
import { Hono } from "hono";

import { json } from "@/shared/http";
import { verifierJsonError } from "@/verifier/errors";

export const signRoutes = new Hono<{ Bindings: Env }>();

signRoutes.post("/sign", async (c) => {
  try {
    const body = (await c.req.json()) as { transactions?: string[] };
    if (!Array.isArray(body.transactions) || body.transactions.length === 0) {
      return json(
        { error: "transactions required", code: "invalid_transaction" },
        { status: 400 },
      );
    }

    const result = await c.env.VERIFIER_SIGNER.signTransactions(
      body.transactions,
    );
    if (!result.ok) {
      return json(result.body, { status: result.status });
    }
    return json({ signatures: result.signatures });
  } catch (err) {
    return verifierJsonError(err, "sign");
  }
});
