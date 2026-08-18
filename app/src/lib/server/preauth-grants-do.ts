import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { PreauthGrant } from "../../../worker/preauth-grant-types";

/** RPC surface of PreauthGrantsDO — keep in sync with the worker. */
export type PreauthGrantsStub = {
  rotate(): Promise<{ gen: number }>;
  open(args: {
    wallet: string;
    gen: number;
    maxAmount: string;
    mint: string | null;
  }): Promise<PreauthGrant>;
  cancel(): Promise<void>;
  claim(args: {
    wallet: string;
    amount: string;
    mint: string;
    jobId: string;
  }): Promise<{ grantId: string }>;
  consume(args: { grantId: string }): Promise<void>;
  releaseClaim(args: { grantId: string }): Promise<void>;
};

export function getPreauthGrantsStub(wallet: string): PreauthGrantsStub {
  const ns = getCloudflareContext().env.PREAUTH_GRANTS;
  if (!ns) {
    throw new Error("PREAUTH_GRANTS Durable Object binding is not configured");
  }
  return ns.get(ns.idFromName(wallet));
}
