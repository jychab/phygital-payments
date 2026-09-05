import { queryFetch, readJson } from "@/lib/queries/http";
import { withDeviceAuth } from "@/lib/wallet/device-auth-client";
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

/** GET standing `PolicyDocument` (default when no row). */
export async function fetchPolicyDocument(
  phygitalToken: string,
): Promise<PolicyDocument> {
  const res = await queryFetch(`/policies/${encodeURIComponent(phygitalToken)}`);
  const body = await readJson<{ policy: PolicyDocument }>(
    res,
    "Couldn’t load settings",
  );
  return body.policy;
}

/** PUT compiled `PolicyDocument` (owner app compiles settings client-side). */
export async function putPolicyDocument(
  phygitalToken: string,
  policy: PolicyDocument,
): Promise<PolicyDocument> {
  return withDeviceAuth(async () => {
    const res = await queryFetch(
      `/policies/${encodeURIComponent(phygitalToken)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy }),
      },
    );
    const body = await readJson<{ policy: PolicyDocument }>(
      res,
      "Couldn’t save settings",
    );
    return body.policy;
  });
}

export async function createOneTimeGrant(
  phygitalToken: string,
  intentHash: string,
): Promise<void> {
  await withDeviceAuth(async () => {
    const res = await queryFetch(
      `/policies/${encodeURIComponent(phygitalToken)}/grants`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intentHash }),
      },
    );
    await readJson(res, "Couldn’t approve this send");
  });
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
  await withDeviceAuth(async () => {
    const res = await queryFetch(
      `/policies/${encodeURIComponent(phygitalToken)}/approvals/${encodeURIComponent(intentHash)}`,
      { method: "DELETE" },
    );
    await readJson(res, "Couldn’t cancel this approval");
  });
}
