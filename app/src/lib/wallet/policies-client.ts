import { queryFetch, readJson } from "@/lib/queries/http";
import { withTokenSessionRetry } from "@/lib/wallet/token-session";

type PolicySummary = {
  maxTransferUsdc: string | null;
  maxTransferSol: string | null;
  recipientMode: "anyone" | "allowlist";
  recipientAllowlist: string[];
  recipientDenylist: string[];
  allowedPrograms: string[];
};

export async function fetchEffectivePolicy(
  phygitalToken: string,
): Promise<PolicySummary> {
  const res = await queryFetch(`/policies/${encodeURIComponent(phygitalToken)}`);
  const body = await readJson<{ summary: PolicySummary }>(
    res,
    "Couldn’t load settings",
  );
  return body.summary;
}

export async function putPolicySummary(
  phygitalToken: string,
  summary: Partial<PolicySummary>,
): Promise<void> {
  await withTokenSessionRetry(async () => {
    const res = await queryFetch(
      `/policies/${encodeURIComponent(phygitalToken)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      },
    );
    await readJson(res, "Couldn’t save settings");
  });
}

export async function createOneTimeGrant(
  phygitalToken: string,
  intentHash: string,
): Promise<void> {
  await withTokenSessionRetry(async () => {
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
