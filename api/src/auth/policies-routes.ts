import { Hono } from "hono";

import { json } from "@/shared/http";
import { requireTokenSession } from "@/auth/token-session";
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

policyRoutes.get("/policies/:phygitalToken", async (c) => {
  const phygitalToken = c.req.param("phygitalToken");
  const effective = await getEffectivePolicy(phygitalToken);
  return json(effective);
});

policyRoutes.put("/policies/:phygitalToken", async (c) => {
  const session = await requireTokenSession(c);
  if (session instanceof Response) return session;

  const body = (await c.req.json()) as {
    policy?: SolanaPolicyDocument;
    summary?: Partial<PolicySummary>;
  };

  const phygitalToken = session.phygitalToken;

  if (body.policy) {
    await upsertPolicyDocument(phygitalToken, body.policy);
  } else if (body.summary) {
    await upsertPolicyFromSummary(phygitalToken, body.summary);
  } else {
    return json(
      { error: "policy or summary required", code: "invalid_transaction" },
      { status: 400 },
    );
  }

  return json(await getEffectivePolicy(phygitalToken));
});

policyRoutes.post("/policies/:phygitalToken/grants", async (c) => {
  const session = await requireTokenSession(c);
  if (session instanceof Response) return session;

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

  const ttlSeconds = Math.min(
    Math.max(body.ttlSeconds ?? 300, 60),
    3600,
  );
  const grant = await createGrant({
    phygitalToken: session.phygitalToken,
    intentHash,
    ttlSeconds,
  });

  return json({
    grantId: grant.grantId,
    intentHash,
    expiresAt: grant.expiresAt,
  });
});
