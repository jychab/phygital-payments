import { SignerError } from "./errors";
import type {
  SignerChallengeStatus,
  SignerCreateChallengeResult,
  SignerCreateSessionKeyRequest,
  SignerCreateSessionKeyResult,
  SignerDestroySessionKeyRequest,
  SignerFeePayerPublicKeyResult,
  SignerPeekChallengeResult,
  SignerProvisionFeePayerKeyRequest,
  SignerSignFeePayerRequest,
  SignerSignFeePayerResult,
  SignerSignSessionRequest,
  SignerSignSessionResult,
} from "./protocol";
import { signerPath, type SignerRpcAction } from "./protocol";

export type SignerTransport = {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  /** Bearer token for HTTP dev transport; omitted for service binding. */
  internalToken?: string;
};

function resolveUrl(origin: string, input: RequestInfo | URL): string {
  const path = typeof input === "string" ? input : input.toString();
  return path.startsWith("http") ? path : `${origin}${path}`;
}

async function rpc<T>(
  transport: SignerTransport,
  action: SignerRpcAction,
  body?: unknown,
  method: "GET" | "POST" = "POST",
): Promise<T> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (transport.internalToken) {
    headers.authorization = `Bearer ${transport.internalToken}`;
  }

  let url = signerPath(action);
  let init: RequestInit;
  if (method === "GET") {
    const params = new URLSearchParams((body ?? {}) as Record<string, string>);
    const qs = params.toString();
    if (qs) url = `${url}?${qs}`;
    init = { method: "GET", headers };
  } else {
    init = { method: "POST", headers, body: JSON.stringify(body ?? {}) };
  }

  const response = await transport.fetch(url, init);
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
  };
  if (!response.ok) {
    throw SignerError.fromResponse(response.status, {
      error: payload.error ?? "Signer request failed",
      code: payload.code,
    });
  }
  return payload as T;
}

export class SignerClient {
  constructor(private readonly transport: SignerTransport) {}

  createChallenge(origin: string): Promise<SignerCreateChallengeResult> {
    return rpc(this.transport, "createChallenge", { origin });
  }

  getChallenge(requestId: string): Promise<SignerChallengeStatus> {
    return rpc(this.transport, "getChallenge", { requestId }, "GET");
  }

  peekChallenge(requestId: string): Promise<SignerPeekChallengeResult> {
    return rpc(this.transport, "peekChallenge", { requestId });
  }

  createSessionKey(
    req: SignerCreateSessionKeyRequest,
  ): Promise<SignerCreateSessionKeyResult> {
    return rpc(this.transport, "createSessionKey", req);
  }

  destroySessionKey(
    req: SignerDestroySessionKeyRequest,
  ): Promise<{ ok: true }> {
    return rpc(this.transport, "destroySessionKey", req);
  }

  provisionFeePayerKey(
    req: SignerProvisionFeePayerKeyRequest,
  ): Promise<SignerFeePayerPublicKeyResult> {
    return rpc(this.transport, "provisionFeePayerKey", req);
  }

  getFeePayerPublicKey(): Promise<SignerFeePayerPublicKeyResult> {
    return rpc(this.transport, "getFeePayerPublicKey", {}, "GET");
  }

  signSession(req: SignerSignSessionRequest): Promise<SignerSignSessionResult> {
    return rpc(this.transport, "signSession", req);
  }

  signFeePayer(
    req: SignerSignFeePayerRequest,
  ): Promise<SignerSignFeePayerResult> {
    return rpc(this.transport, "signFeePayer", req);
  }
}

/** Service binding transport (production / `dev:workers`). */
export function signerBindingTransport(
  fetcher: Fetcher,
  origin = "https://signer.internal",
  internalToken?: string,
): SignerTransport {
  return {
    internalToken,
    fetch(input, init) {
      return fetcher.fetch(resolveUrl(origin, input), init);
    },
  };
}

/** Local HTTP transport (`pnpm dev`). */
export function signerHttpTransport(args: {
  origin: string;
  internalToken: string;
}): SignerTransport {
  const origin = args.origin.replace(/\/$/, "");
  return {
    internalToken: args.internalToken,
    fetch(input, init) {
      return fetch(resolveUrl(origin, input), init);
    },
  };
}
