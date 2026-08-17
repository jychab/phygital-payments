import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  isSlotHashesExpired,
  SLOT_HASHES_KV_TTL_SECONDS,
  slotHashesExpiresAtMs,
} from "../../../shared/slot-hashes";
import type {
  PendingClaimRecord,
  PendingClaimView,
} from "../../../shared/pending-claim-wire";

const KEY_PREFIX = "claim:";

function getPendingClaimKv(): KVNamespace {
  const kv = getCloudflareContext().env.pending_claim;
  if (!kv) {
    throw new Error("KV binding pending_claim is not configured");
  }
  return kv;
}

function claimKey(token: string): string {
  return `${KEY_PREFIX}${token}`;
}

function parseStoredRecord(raw: unknown): PendingClaimRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.asset !== "string" || !o.asset.trim()) return null;
  if (typeof o.slotNumber !== "string" || !o.slotNumber.trim()) return null;
  if (!o.auth || typeof o.auth !== "object") return null;
  if (typeof o.createdAtMs !== "number" || !Number.isFinite(o.createdAtMs)) {
    return null;
  }

  return {
    asset: o.asset.trim(),
    slotNumber: o.slotNumber.trim(),
    auth: o.auth as PendingClaimRecord["auth"],
    createdAtMs: o.createdAtMs,
  };
}

function withExpiry(record: PendingClaimRecord): PendingClaimView {
  return {
    ...record,
    expiresAtMs: slotHashesExpiresAtMs(record.createdAtMs),
  };
}

export async function writePendingClaim(args: {
  token: string;
  record: Omit<PendingClaimRecord, "createdAtMs">;
}): Promise<{ expiresAtMs: number }> {
  const createdAtMs = Date.now();
  const record: PendingClaimRecord = {
    ...args.record,
    createdAtMs,
  };

  await getPendingClaimKv().put(claimKey(args.token), JSON.stringify(record), {
    expirationTtl: SLOT_HASHES_KV_TTL_SECONDS,
  });

  return { expiresAtMs: slotHashesExpiresAtMs(createdAtMs) };
}

export async function readPendingClaim(
  token: string,
): Promise<PendingClaimView | null> {
  const raw = await getPendingClaimKv().get(claimKey(token));
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const record = parseStoredRecord(parsed);
  if (!record || isSlotHashesExpired(record.createdAtMs)) {
    return null;
  }

  return withExpiry(record);
}

export async function consumePendingClaim(token: string): Promise<boolean> {
  const record = await readPendingClaim(token);
  if (!record) return false;
  await getPendingClaimKv().delete(claimKey(token));
  return true;
}
