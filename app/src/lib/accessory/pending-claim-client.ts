import { queryFetch, readJson } from "@/lib/queries/http";
import type {
  CreatePendingClaimResponse,
  PendingClaimRecord,
  PendingClaimView,
} from "../../../shared/pending-claim-wire";

/** Client for `/api/claim/pending` — Safari tap handoff to `/accessory?token=`. */
export async function createPendingClaim(
  body: Omit<PendingClaimRecord, "createdAtMs">,
): Promise<CreatePendingClaimResponse> {
  const res = await queryFetch("/api/claim/pending", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return readJson<CreatePendingClaimResponse>(res, "Couldn’t save your tap.");
}

export async function fetchPendingClaim(
  token: string,
): Promise<PendingClaimView> {
  const res = await queryFetch(
    `/api/claim/pending?token=${encodeURIComponent(token)}`,
  );
  return readJson<PendingClaimView>(res, "Couldn’t load this. Try again.");
}

export async function consumePendingClaim(token: string): Promise<void> {
  const res = await queryFetch(
    `/api/claim/pending?token=${encodeURIComponent(token)}`,
    { method: "DELETE" },
  );
  await readJson(res, "Couldn’t finish. Try again.");
}
