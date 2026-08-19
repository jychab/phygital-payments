import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { PreauthGrant } from "../../../worker/preauth-grant-types";
import {
  INVALID_API_KEY,
  REVOKED_API_KEY,
  parseApiKey,
  type ParsedApiKey,
} from "../../../worker/api-key-hmac";

/** RPC surface of PreauthGrantsDO — keep in sync with the worker. */
export type PreauthGrantsStub = {
  rotate(): Promise<{ gen: number }>;
  currentGeneration(): Promise<number>;
  open(args: { gen: number }): Promise<PreauthGrant>;
  cancel(): Promise<void>;
  claim(args: { jobId: string }): Promise<{ grantId: string }>;
  consume(args: { grantId: string }): Promise<void>;
  releaseClaim(args: { grantId: string }): Promise<void>;
};

export function getHmacSecret(): string {
  const secret = process.env.PAY_HMAC_SECRET?.trim();
  if (!secret) throw new Error("PAY_HMAC_SECRET is not configured");
  return secret;
}

export function getPreauthGrantsStub(wallet: string): PreauthGrantsStub {
  const ns = getCloudflareContext().env.PREAUTH_GRANTS;
  if (!ns) {
    throw new Error("PREAUTH_GRANTS Durable Object binding is not configured");
  }
  return ns.get(ns.idFromName(wallet));
}

/** HMAC-parse the key and reject it when generation is stale. */
export async function requireLiveApiKey(apiKey: string): Promise<ParsedApiKey> {
  const parsed = await parseApiKey(getHmacSecret(), apiKey);
  if (!parsed) throw new Error(INVALID_API_KEY);
  const generation = await getPreauthGrantsStub(parsed.wallet).currentGeneration();
  if (parsed.gen < generation) throw new Error(REVOKED_API_KEY);
  return parsed;
}

export function isApiKeyAuthError(message: string): boolean {
  return message === INVALID_API_KEY || message === REVOKED_API_KEY;
}
