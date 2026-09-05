import { defineStandardPolicy, type PolicyDocument } from "phygital-verifier-sdk";
import type { StandardPolicyOptions } from "phygital-verifier-sdk";

import { getUsdcMint } from "@/tokens/usdc-mint";

/** Default standing policy when no row exists in D1. */
export function buildDefaultPolicy(
  opts: Omit<StandardPolicyOptions, "mint"> = {},
): PolicyDocument {
  return defineStandardPolicy({
    mint: String(getUsdcMint()),
    ...opts,
  });
}
