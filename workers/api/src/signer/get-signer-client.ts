import {
  SignerClient,
  signerBindingTransport,
  signerHttpTransport,
} from "./client";
import { getEnv } from "@/platform/request-context";

const DEFAULT_HTTP_ORIGIN = "http://127.0.0.1:8788";

/** Resolve a SignerClient from API worker env (binding or local HTTP). */
export function getSignerClient(): SignerClient {
  const env = getEnv();
  const internalToken = env.SIGNER_INTERNAL_TOKEN?.trim();
  if (!internalToken) {
    throw new Error("SIGNER_INTERNAL_TOKEN is not configured");
  }

  const httpOrigin = env.SIGNER_ORIGIN?.trim();
  // Prefer explicit HTTP origin in dev (`pnpm dev` runs signer on :8788).
  if (httpOrigin) {
    return new SignerClient(
      signerHttpTransport({ origin: httpOrigin, internalToken }),
    );
  }

  if (env.SIGNER) {
    return new SignerClient(
      signerBindingTransport(env.SIGNER, "https://signer.internal", internalToken),
    );
  }

  return new SignerClient(
    signerHttpTransport({
      origin: DEFAULT_HTTP_ORIGIN,
      internalToken,
    }),
  );
}
