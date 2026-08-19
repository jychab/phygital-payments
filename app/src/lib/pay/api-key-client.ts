import {
  clearApiKey,
  readApiKey,
  storeApiKey,
} from "@/lib/pay/api-key-store";
import { queryFetch } from "@/lib/queries/http";

export async function verifyApiKey(
  wallet: string,
  apiKey: string,
): Promise<void> {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    throw new Error("Paste an API key first.");
  }
  const res = await queryFetch("/api/preauth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: trimmed, owner: wallet }),
  });
  const body = (await res.json()) as { error?: string };
  if (!res.ok) {
    const error = new Error(body.error ?? "Couldn’t verify API key");
    if (res.status === 401 || res.status === 403) {
      error.name = "RejectedApiKeyError";
    }
    throw error;
  }
}

export async function verifyAndStoreApiKey(
  wallet: string,
  apiKey: string,
): Promise<void> {
  const trimmed = apiKey.trim();
  await verifyApiKey(wallet, trimmed);
  storeApiKey(wallet, trimmed);
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
