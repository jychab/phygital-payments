import { queryFetch } from "@/lib/queries/http";
import type { SubmitTransferRequest } from "./settle-types";

/**
 * POST the transfer payload to an owner's custom verifier endpoint.
 * That service builds/signs/sends with feePayer = verifier and returns the sig.
 * Retries transient network blips (same payload — verifier should be idempotent).
 */
export async function submitTransferViaOwnerVerifier(args: {
  endpoint: string;
  payload: SubmitTransferRequest;
}): Promise<{ signature: string }> {
  const endpoint = args.endpoint.trim();
  if (!endpoint.startsWith("https://")) {
    throw new Error("Owner verifier endpoint must be an https URL");
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await queryFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args.payload),
      });

      const body = (await res.json().catch(() => ({}))) as {
        signature?: string;
        error?: string;
      };

      if (!res.ok) {
        const err = new Error(
          body.error ?? `Owner verifier submit failed (${res.status})`,
        );
        (err as Error & { status?: number }).status = res.status;
        // 4xx from verifier is business — don't retry.
        if (res.status >= 400 && res.status < 500 && res.status !== 408) {
          throw err;
        }
        throw err;
      }
      if (!body.signature) {
        throw new Error("Owner verifier response missing signature");
      }
      return { signature: body.signature };
    } catch (error) {
      lastError = error;
      const status = (error as Error & { status?: number })?.status;
      const retryable =
        status == null ||
        status === 408 ||
        status === 429 ||
        (status >= 500 && status <= 599);
      if (!retryable || attempt === 2) {
        throw error instanceof Error ? error : new Error(String(error));
      }
      await new Promise((r) => setTimeout(r, 200 * 2 ** attempt));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Owner verifier submit failed");
}
