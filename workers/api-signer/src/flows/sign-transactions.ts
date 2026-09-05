import { assertFeeBalance } from "@/fees/fee-balance-gate";
import { authorizeIntent } from "@/verifier/approval";
import { decodeWireTransaction } from "@/verifier/decode-tx";
import type { SignTransactionsResult } from "@/verifier/signer-service";

import type { VerifierSignerBackend } from "../backend/types.js";

export type { SignTransactionsResult };

/**
 * canSign → fee → authorize(sign) → backend.sign.
 * Verifier membership before fee/grant mutate; fee before authorize so a failed
 * fee check cannot consume an Approve-once grant.
 */
export async function signTransactions(
  transactions: string[],
  backend: VerifierSignerBackend,
): Promise<SignTransactionsResult> {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return {
      ok: false,
      status: 400,
      body: {
        error: "transactions required",
        code: "invalid_transaction",
        soft: false,
      },
    };
  }

  const signatures: string[] = [];

  for (const wire of transactions) {
    const decoded = decodeWireTransaction(wire);

    if (!(await backend.canSign(decoded.verifier))) {
      return {
        ok: false,
        status: 403,
        body: {
          error: "Transaction verifier does not match this signing service",
          code: "verifier_mismatch",
          soft: false,
          details: {
            got: decoded.verifier,
            phygitalToken: decoded.phygitalToken,
          },
        },
      };
    }

    const fee = await assertFeeBalance({
      phygitalToken: decoded.phygitalToken,
      instructions: decoded.instructions,
    });
    if (!fee.ok) {
      return {
        ok: false,
        status: 403,
        body: {
          error: fee.error,
          code: fee.code,
          soft: fee.soft,
          details: {
            ...fee.details,
            phygitalToken: decoded.phygitalToken,
          },
        },
      };
    }

    const result = await authorizeIntent({
      phygitalToken: decoded.phygitalToken,
      instructions: decoded.instructions,
      mode: "sign",
    });

    if (!result.ok) {
      return {
        ok: false,
        status: 403,
        body: {
          error: result.error,
          code: result.code,
          soft: result.soft,
          details: {
            ...result.details,
            phygitalToken: decoded.phygitalToken,
            intentHash: result.intentHash,
          },
        },
      };
    }

    signatures.push(await backend.sign(decoded.verifier, decoded.messageBytes));
  }

  return { ok: true, signatures };
}
