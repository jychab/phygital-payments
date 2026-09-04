import { Hono } from "hono";

import { assertOwnerLink } from "@/auth/device-db";
import { requireDeviceSession } from "@/auth/device-session";
import {
  listOpenApprovals,
  resolvePendingApproval,
} from "@/auth/pending-approvals-db";
import { json } from "@/shared/http";
import {
  createGrant,
  getEffectivePolicy,
  upsertPolicyDocument,
  upsertPolicyFromSummary,
} from "@/verifier/approval/policy-db";
import type {
  PolicySummary,
  SolanaPolicyDocument,
} from "@/verifier/approval/types";

export const policyRoutes = new Hono();

async function requireOwnerSession(c: Parameters<typeof requireDeviceSession>[0]) {
  const session = await requireDeviceSession(c);
  if (session instanceof Response) return session;

  const phygitalToken = c.req.param("phygitalToken")?.trim();
  if (!phygitalToken) {
    return c.json(
      { error: "Missing phygitalToken", code: "invalid_transaction" },
      400,
    );
  }

  if (!(await assertOwnerLink(session.credentialId, phygitalToken))) {
    return c.json(
      { error: "Only the owner phone can do this.", code: "not_owner" },
      403,
    );
  }

  return { session, phygitalToken };
}

policyRoutes.get("/policies/:phygitalToken", async (c) => {
  const phygitalToken = c.req.param("phygitalToken");
  const effective = await getEffectivePolicy(phygitalToken);
  return json(effective);
});

policyRoutes.put("/policies/:phygitalToken", async (c) => {
  const owner = await requireOwnerSession(c);
  if (owner instanceof Response) return owner;

  const body = (await c.req.json()) as {
    policy?: SolanaPolicyDocument;
    summary?: Partial<PolicySummary>;
  };

  if (body.policy) {
    await upsertPolicyDocument(owner.phygitalToken, body.policy);
  } else if (body.summary) {
    await upsertPolicyFromSummary(owner.phygitalToken, body.summary);
  } else {
    return json(
      { error: "policy or summary required", code: "invalid_transaction" },
      { status: 400 },
    );
  }

  return json(await getEffectivePolicy(owner.phygitalToken));
});

policyRoutes.post("/policies/:phygitalToken/grants", async (c) => {
  const owner = await requireOwnerSession(c);
  if (owner instanceof Response) return owner;

  const body = (await c.req.json()) as {
    intentHash?: string;
    ttlSeconds?: number;
  };
  const intentHash = body.intentHash?.trim();
  if (!intentHash) {
    return json(
      { error: "intentHash required", code: "invalid_transaction" },
      { status: 400 },
    );
  }

  const ttlSeconds = Math.min(Math.max(body.ttlSeconds ?? 300, 60), 3600);
  const grant = await createGrant({
    phygitalToken: owner.phygitalToken,
    intentHash,
    ttlSeconds,
  });

  return json({
    grantId: grant.grantId,
    intentHash,
    expiresAt: grant.expiresAt,
  });
});

policyRoutes.get("/policies/:phygitalToken/approvals", async (c) => {
  const owner = await requireOwnerSession(c);
  if (owner instanceof Response) {
    // Visitors / unsigned: empty inbox (do not leak).
    if (owner.status === 401 || owner.status === 403) {
      return json({ approvals: [] });
    }
    return owner;
  }

  const approvals = await listOpenApprovals(owner.phygitalToken);
  return json({ approvals });
});

policyRoutes.delete(
  "/policies/:phygitalToken/approvals/:intentHash",
  async (c) => {
    const owner = await requireOwnerSession(c);
    if (owner instanceof Response) return owner;

    const intentHash = c.req.param("intentHash")?.trim();
    if (!intentHash) {
      return json(
        { error: "intentHash required", code: "invalid_transaction" },
        { status: 400 },
      );
    }

    await resolvePendingApproval(owner.phygitalToken, intentHash);
    return json({ ok: true });
  },
);
