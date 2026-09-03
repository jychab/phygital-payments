import { queryFetch, readJson } from "@/lib/queries/http";
import {
  ASSOCIATED_TOKEN_PROGRAM,
  CLASSIC_TOKEN_PROGRAM,
  SYSTEM_PROGRAM,
  TOKEN_2022_PROGRAM,
} from "@/lib/tokens/payment-token";
import { withTokenSessionRetry } from "@/lib/wallet/token-session";

/** Must match `api/src/verifier/approval/types.ts` DEFAULT_ALLOWED_PROGRAMS. */
export const DEFAULT_ALLOWED_PROGRAMS = [
  String(CLASSIC_TOKEN_PROGRAM),
  String(TOKEN_2022_PROGRAM),
  String(ASSOCIATED_TOKEN_PROGRAM),
  String(SYSTEM_PROGRAM),
  "ComputeBudget111111111111111111111111111111",
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  "auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg",
  "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d",
  "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY",
  "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK",
  "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV",
] as const;

export type PolicySummary = {
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
