/** Client helpers for the payer-side preauth spending window. */

import { API_KEY_NOT_SET_UP, readApiKey } from "@/lib/pay/api-key-store";
import { QueryHttpError, queryFetch, readJson } from "@/lib/queries/http";
import type {
  PreauthStatusCopy,
  PreauthStatusResult,
} from "../../../shared/preauth-status";

export type PreauthResponse = PreauthStatusCopy & {
  expiresAt: number;
  grantId: string;
  wallet: string;
};

export type { PreauthStatusResult };

function storedApiKey(wallet: string): string {
  const apiKey = readApiKey(wallet);
  if (!apiKey) throw new Error(API_KEY_NOT_SET_UP);
  return apiKey;
}

export async function requestPreauthForWallet(args: {
  wallet: string;
}): Promise<PreauthResponse> {
  const res = await queryFetch("/api/preauth/open", {
    method: "GET",
    headers: { "x-api-key": storedApiKey(args.wallet) },
  });
  return readJson<PreauthResponse>(res, `Preauth failed (${res.status})`);
}

export async function waitPreauthStatusForWallet(args: {
  wallet: string;
  grantId: string;
  signal?: AbortSignal;
}): Promise<PreauthStatusResult> {
  const params = new URLSearchParams();
  params.set("grantId", args.grantId);

  const res = await queryFetch(`/api/preauth/status?${params.toString()}`, {
    method: "GET",
    headers: { "x-api-key": storedApiKey(args.wallet) },
    signal: args.signal,
  });
  return readJson<PreauthStatusResult>(
    res,
    `Preauth status failed (${res.status})`,
  );
}

export async function cancelPreauthForWallet(args: {
  wallet: string;
}): Promise<void> {
  const res = await queryFetch("/api/preauth", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${storedApiKey(args.wallet)}` },
  });
  if (!res.ok && res.status !== 401) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new QueryHttpError(
      body.error ?? `Cancel preauth failed (${res.status})`,
      res.status,
    );
  }
}
