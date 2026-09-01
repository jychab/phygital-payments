import {
  clearApiKey,
  readApiKey,
} from "@/lib/pay/api-key-store";
import { QueryHttpError, queryFetch } from "@/lib/queries/http";

async function verifyApiKey(
  wallet: string,
  apiKey: string,
): Promise<void> {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    throw new Error("Missing API key.");
  }
  const res = await queryFetch("/api/preauth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: trimmed, owner: wallet }),
  });
  const body = (await res.json()) as { error?: string };
  if (!res.ok) {
    const error = new QueryHttpError(
      body.error ?? "Couldn’t use that",
      res.status,
    );
    if (res.status === 401 || res.status === 403) {
      error.name = "RejectedApiKeyError";
    }
    throw error;
  }
}

export async function verifyStoredApiKey(wallet: string): Promise<boolean> {
  const stored = readApiKey(wallet);
  if (!stored) return false;
  try {
    await verifyApiKey(wallet, stored);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === "RejectedApiKeyError") {
      clearApiKey(wallet);
      return false;
    }
    throw error;
  }
}
