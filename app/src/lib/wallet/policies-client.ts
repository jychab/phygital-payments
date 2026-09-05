import { queryFetch, readJson } from "@/lib/queries/http";
import type { PolicyDocument } from "phygital-verifier-sdk";

export type OpenApproval = {
  id: string;
  phygitalToken: string;
  intentHash: string;
  code: string;
  error: string;
  details: Record<string, unknown> | null;
  expiresAt: number;
  createdAt: number;
};

export type PolicyStatus = "none" | "ok" | "invalid";

export type EffectivePolicy = {
  policy: PolicyDocument | null;
  status: PolicyStatus;
};

function asEffective(
  body: { policy: PolicyDocument | null; status?: PolicyStatus },
  fallback: PolicyStatus = body.policy ? "ok" : "none",
): EffectivePolicy {
  return {
    policy: body.policy,
    status: body.status ?? fallback,
  };
}

/** GET standing policy (owner session required). */
export async function fetchEffectivePolicy(
  phygitalToken: string,
): Promise<EffectivePolicy> {
  const res = await queryFetch(`/policies/${encodeURIComponent(phygitalToken)}`);
  const body = await readJson<{
    policy: PolicyDocument | null;
    status?: PolicyStatus;
  }>(res, "Couldn’t load settings");
  return asEffective(body);
}

/**
 * PUT compiled `PolicyDocument`. Requires an existing device session + owner
 * link — no lazy Face ID (send user to Home setup on 401).
 */
export async function putPolicyDocument(
  phygitalToken: string,
  policy: PolicyDocument,
): Promise<EffectivePolicy> {
  const res = await queryFetch(
    `/policies/${encodeURIComponent(phygitalToken)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ policy }),
    },
  );
  const body = await readJson<{
    policy: PolicyDocument | null;
    status?: PolicyStatus;
  }>(res, "Couldn’t save settings");
  return asEffective(body);
}

/** DELETE standing policy (limits off). */
export async function deletePolicyDocument(
  phygitalToken: string,
): Promise<EffectivePolicy> {
  const res = await queryFetch(
    `/policies/${encodeURIComponent(phygitalToken)}`,
    { method: "DELETE" },
  );
  const body = await readJson<{
    policy: PolicyDocument | null;
    status?: PolicyStatus;
  }>(res, "Couldn’t turn off limits");
  return asEffective(body, "none");
}

export async function createOneTimeGrant(
  phygitalToken: string,
  intentHash: string,
): Promise<void> {
  const res = await queryFetch(
    `/policies/${encodeURIComponent(phygitalToken)}/grants`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intentHash }),
    },
  );
  await readJson(res, "Couldn’t approve this send");
}

export async function fetchOpenApprovals(
  phygitalToken: string,
): Promise<OpenApproval[]> {
  const res = await queryFetch(
    `/policies/${encodeURIComponent(phygitalToken)}/approvals`,
  );
  const body = await readJson<{ approvals: OpenApproval[] }>(
    res,
    "Couldn’t load approvals",
  );
  return body.approvals;
}

export async function cancelOpenApproval(
  phygitalToken: string,
  intentHash: string,
): Promise<void> {
  const res = await queryFetch(
    `/policies/${encodeURIComponent(phygitalToken)}/approvals/${encodeURIComponent(intentHash)}`,
    { method: "DELETE" },
  );
  await readJson(res, "Couldn’t cancel this approval");
}
