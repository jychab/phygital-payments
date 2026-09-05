/**
 * Revibase standing policies + one-time grants ("Approve once").
 *
 * Standing policy is opt-in (D1 row). Custom instruction policy belongs in
 * `phygital-verifier-sdk` (`defineStandardPolicy` / `createVerifier`).
 * This module orchestrates D1-backed grants around soft denies.
 */
import type { Instruction } from "phygital-verifier-sdk";
import { hashIntent } from "@/verifier/intent-hash";
import {
  consumeGrant,
  findValidGrant,
  loadPolicyDocument,
} from "@/verifier/approval/policy-db";
import { evaluatePolicy } from "@/verifier/approval/policy-engine";

type AuthorizeRequest = {
  phygitalToken: string;
  instructions: readonly Instruction[];
  /**
   * `preview` — soft deny may still pass if an unused grant exists (no consume).
   * `sign` — soft deny requires consuming a grant.
   */
  mode: "preview" | "sign";
};

type AuthorizeResult =
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
  const [intentHash, loaded] = await Promise.all([
    hashIntent(req.phygitalToken, req.instructions),
    loadPolicyDocument(req.phygitalToken),
  ]);

  if (loaded === "invalid") {
    return {
      ok: false,
      intentHash,
      code: "invalid_policy",
      error: "Standing policy is invalid and must be fixed by the owner.",
      soft: false,
    };
  }

  const verdict = evaluatePolicy(loaded, req.instructions);

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
  } else if (await consumeGrant(req.phygitalToken, intentHash)) {
    return { ok: true, intentHash };
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
