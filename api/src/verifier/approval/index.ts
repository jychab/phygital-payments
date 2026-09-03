/**
 * Transaction approval — **replace this module** when forking the verifier.
 *
 * Revibase ships standing Privy-shaped policies in D1 plus one-time grants
 * ("Approve once" in the owner app). Most custom verifiers should implement
 * their own rules here (merchant keys, allowlists, human review, etc.) and
 * leave `../preview.ts` / `../sign.ts` unchanged.
 */
import type { IntentInstruction } from "@/verifier/constants";
import { hashIntent } from "@/verifier/intent-hash";
import {
  consumeGrant,
  findValidGrant,
  loadPolicyDocument,
} from "@/verifier/approval/policy-db";
import { evaluatePolicy } from "@/verifier/approval/policy-engine";

export type AuthorizeRequest = {
  phygitalToken: string;
  instructions: readonly IntentInstruction[];
  /**
   * `preview` — soft deny may still pass if an unused grant exists (no consume).
   * `sign` — soft deny requires consuming a grant.
   */
  mode: "preview" | "sign";
};

export type AuthorizeResult =
  | { ok: true; intentHash: string }
  | {
      ok: false;
      intentHash: string;
      code: string;
      error: string;
      soft: boolean;
      details?: Record<string, unknown>;
    };

export async function authorizeIntent(
  req: AuthorizeRequest,
): Promise<AuthorizeResult> {
  const intentHash = await hashIntent(req.phygitalToken, req.instructions);
  const { policy } = await loadPolicyDocument(req.phygitalToken);
  const verdict = await evaluatePolicy(policy, [...req.instructions]);

  if (verdict.ok) {
    return { ok: true, intentHash };
  }

  if (!verdict.soft) {
    return {
      ok: false,
      intentHash,
      code: verdict.code,
      error: verdict.error,
      soft: false,
      details: verdict.details,
    };
  }

  if (req.mode === "preview") {
    const grant = await findValidGrant(req.phygitalToken, intentHash);
    if (grant) return { ok: true, intentHash };
  } else {
    // Soft deny on /sign: consume a one-time grant if the owner approved this intent.
    if (await consumeGrant(req.phygitalToken, intentHash)) {
      return { ok: true, intentHash };
    }
    if (await findValidGrant(req.phygitalToken, intentHash)) {
      await consumeGrant(req.phygitalToken, intentHash);
      return { ok: true, intentHash };
    }
  }

  return {
    ok: false,
    intentHash,
    code: verdict.code,
    error: verdict.error,
    soft: true,
    details: verdict.details,
  };
}
