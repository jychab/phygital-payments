import { getD1 } from "@/shared/db";
import { buildDefaultPolicy } from "@/verifier/approval/policy-defaults";
import {
  compileSummaryToPolicy,
  deriveSummary,
} from "@/verifier/approval/policy-engine";
import type {
  PolicySummary,
  SolanaPolicyDocument,
} from "@/verifier/approval/types";

function db() {
  return getD1();
}

export async function loadPolicyDocument(
  phygitalToken: string,
): Promise<{ policy: SolanaPolicyDocument; isDefault: boolean }> {
  const row = await db()
    .prepare(
      `SELECT policy_json FROM token_policies WHERE phygital_token = ?`,
    )
    .bind(phygitalToken)
    .first<{ policy_json: string }>();

  if (!row?.policy_json) {
    return { policy: buildDefaultPolicy(), isDefault: true };
  }
  try {
    return {
      policy: JSON.parse(row.policy_json) as SolanaPolicyDocument,
      isDefault: false,
    };
  } catch {
    return { policy: buildDefaultPolicy(), isDefault: true };
  }
}

export async function getEffectivePolicy(phygitalToken: string): Promise<{
  phygitalToken: string;
  policy: SolanaPolicyDocument;
  isDefault: boolean;
  summary: PolicySummary;
}> {
  const { policy, isDefault } = await loadPolicyDocument(phygitalToken);
  return {
    phygitalToken,
    policy,
    isDefault,
    summary: deriveSummary(policy),
  };
}

export async function upsertPolicyDocument(
  phygitalToken: string,
  policy: SolanaPolicyDocument,
): Promise<void> {
  const now = Date.now();
  await db()
    .prepare(
      `INSERT INTO token_policies (phygital_token, policy_json, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(phygital_token) DO UPDATE SET
         policy_json = excluded.policy_json,
         updated_at = excluded.updated_at`,
    )
    .bind(phygitalToken, JSON.stringify(policy), now)
    .run();
}

export async function upsertPolicyFromSummary(
  phygitalToken: string,
  summary: Partial<PolicySummary>,
): Promise<SolanaPolicyDocument> {
  const { policy } = await loadPolicyDocument(phygitalToken);
  const next = compileSummaryToPolicy(summary, policy);
  await upsertPolicyDocument(phygitalToken, next);
  return next;
}

export async function findValidGrant(
  phygitalToken: string,
  intentHash: string,
  now = Date.now(),
): Promise<{ id: string } | null> {
  const row = await db()
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
  await db()
    .prepare(
      `INSERT INTO one_time_grants
         (id, phygital_token, intent_hash, expires_at, consumed_at, created_at)
       VALUES (?, ?, ?, ?, NULL, ?)`,
    )
    .bind(grantId, args.phygitalToken, args.intentHash, expiresAt, now)
    .run();
  return { grantId, expiresAt };
}

export async function consumeGrant(
  phygitalToken: string,
  intentHash: string,
  now = Date.now(),
): Promise<boolean> {
  const result = await db()
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
