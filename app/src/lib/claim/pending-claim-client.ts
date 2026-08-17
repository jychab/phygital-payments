import type {
  CreatePendingClaimResponse,
  PendingClaimRecord,
  PendingClaimView,
} from "../../../shared/pending-claim-wire";

async function readJson<T>(res: Response, fallback: string): Promise<T> {
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(body.error ?? fallback);
  }
  return body;
}

export async function createPendingClaim(
  body: Omit<PendingClaimRecord, "createdAtMs">,
): Promise<CreatePendingClaimResponse> {
  const res = await fetch("/api/claim/pending", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return readJson<CreatePendingClaimResponse>(res, "Couldn’t save your tap.");
}

export async function fetchPendingClaim(
  token: string,
): Promise<PendingClaimView> {
  const res = await fetch(
    `/api/claim/pending?token=${encodeURIComponent(token)}`,
  );
  return readJson<PendingClaimView>(res, "Couldn’t load your tap proof.");
}

export async function consumePendingClaim(token: string): Promise<void> {
  const res = await fetch(
    `/api/claim/pending?token=${encodeURIComponent(token)}`,
    { method: "DELETE" },
  );
  await readJson(res, "Couldn’t finalize the tap session.");
}
