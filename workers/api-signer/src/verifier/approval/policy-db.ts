import {
  validatePolicy,
  type PolicyDocument,
} from "phygital-verifier-sdk";
import { getD1 } from "@/shared/db";

/**
 * Reuse the same PolicyDocument object when D1 JSON is unchanged so the SDK
 * verifier WeakMap compile cache hits (avoids JSON.stringify every verify).
 */
const policyObjectCache = new Map<
  string,
  { json: string | null; policy: PolicyDocument | null | "invalid" }
>();

/** Keep SDK `PolicyDocument` fields only; reject malformed input. */
function stripToPolicyDocument(raw: unknown): PolicyDocument | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.programs)) return null;

  const transaction =
    obj.transaction && typeof obj.transaction === "object"
      ? (obj.transaction as PolicyDocument["transaction"])
      : undefined;
  const version = typeof obj.version === "string" ? obj.version : undefined;

  return {
    ...(version ? { version } : {}),
    programs: obj.programs as PolicyDocument["programs"],
    ...(transaction ? { transaction } : {}),
  };
}

/** Stored JSON → document, or `"invalid"` (fail closed on authorize). */
function parseStoredPolicy(policyJson: string): PolicyDocument | "invalid" {
  try {
    const cleaned = stripToPolicyDocument(JSON.parse(policyJson));
    if (!cleaned) return "invalid";
    const valid = validatePolicy(cleaned);
    return valid.ok ? cleaned : "invalid";
  } catch {
    return "invalid";
  }
}

/**
 * D1 standing policy, or `null` when none is configured (opt-in).
 * Corrupt rows return `"invalid"` for fail-closed authorize.
 */
export async function loadPolicyDocument(
  phygitalToken: string,
): Promise<PolicyDocument | null | "invalid"> {
  const row = await getD1()
    .prepare(
      `SELECT policy_json FROM token_policies WHERE phygital_token = ?`,
    )
    .bind(phygitalToken)
    .first<{ policy_json: string }>();

  const json = row?.policy_json ?? null;
  const hit = policyObjectCache.get(phygitalToken);
  if (hit && hit.json === json) return hit.policy;

  const policy = json == null ? null : parseStoredPolicy(json);
  policyObjectCache.set(phygitalToken, { json, policy });
  return policy;
}

export async function findValidGrant(
  phygitalToken: string,
  intentHash: string,
  now = Date.now(),
): Promise<{ id: string } | null> {
  const row = await getD1()
    .prepare(
      `SELECT id FROM one_time_grants
       WHERE phygital_token = ? AND intent_hash = ?
         AND consumed_at IS NULL AND expires_at > ?
       LIMIT 1`,
    )
    .bind(phygitalToken, intentHash, now)
    .first<{ id: string }>();
  return row ?? null;
}

export async function createGrant(args: {
  phygitalToken: string;
  intentHash: string;
  ttlSeconds: number;
}): Promise<{ grantId: string; expiresAt: number }> {
  const now = Date.now();
  const expiresAt = now + args.ttlSeconds * 1000;
  const grantId = crypto.randomUUID();
  await getD1()
    .prepare(
      `INSERT INTO one_time_grants
         (id, phygital_token, intent_hash, expires_at, consumed_at, created_at)
       VALUES (?, ?, ?, ?, NULL, ?)`,
    )
    .bind(grantId, args.phygitalToken, args.intentHash, expiresAt, now)
    .run();

  await getD1()
    .prepare(
      `UPDATE pending_approvals
       SET resolved_at = ?
       WHERE phygital_token = ? AND intent_hash = ?
         AND resolved_at IS NULL`,
    )
    .bind(now, args.phygitalToken, args.intentHash)
    .run();

  return { grantId, expiresAt };
}

export async function consumeGrant(
  phygitalToken: string,
  intentHash: string,
  now = Date.now(),
): Promise<boolean> {
  const result = await getD1()
    .prepare(
      `UPDATE one_time_grants
       SET consumed_at = ?
       WHERE phygital_token = ? AND intent_hash = ?
         AND consumed_at IS NULL AND expires_at > ?`,
    )
    .bind(now, phygitalToken, intentHash, now)
    .run();
  return (result.meta.changes ?? 0) > 0;
}
