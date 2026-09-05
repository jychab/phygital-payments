import { defineStandardPolicy, type PolicyDocument } from "phygital-verifier-sdk";
import type { StandardPolicyOptions } from "phygital-verifier-sdk";

import { getUsdcMint } from "@/tokens/usdc-mint";

/**
 * Template for first enable / client compile — not applied when no D1 row.
 * Missing standing policy ⇒ authorize skips SDK verify (hard-denies only).
 */
export function buildDefaultPolicy(
  opts: Omit<StandardPolicyOptions, "mint"> = {},
): PolicyDocument {
  return defineStandardPolicy({
    mint: String(getUsdcMint()),
    ...opts,
  });
}
