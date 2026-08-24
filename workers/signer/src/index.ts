import {
  handleCreateChallenge,
  handleCreateSessionKey,
  handleDestroySessionKey,
  handleGetChallengeStatus,
  handlePeekChallenge,
  handleSignFeePayer,
  handleSignSession,
} from "./handlers";
import type { SignerEnv } from "./env";
import { SIGNER_REQUEST_EXPIRED, SignerError } from "./errors";
import { getFeePayerPublicKey, provisionFeePayerKey } from "./fee-payer-store";
import { signerPath } from "./protocol";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function errorResponse(message: string, status: number, code?: string): Response {
  return json({ error: message, code }, status);
}

function requireInternalAuth(request: Request, env: SignerEnv): Response | null {
  const token = env.SIGNER_INTERNAL_TOKEN?.trim();
  if (!token) {
    return errorResponse("Signer not configured", 500, "signer_misconfigured");
  }
  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${token}`) {
    return errorResponse("Unauthorized", 401, "unauthorized");
  }
  return null;
}

function mapHandlerError(error: unknown): Response {
  if (error instanceof SignerError) {
    return errorResponse(error.message, error.status, error.code);
  }
  if (error instanceof Error) {
    return errorResponse(error.message, 500);
  }
  return errorResponse("Internal signer error", 500);
}

export default {
  async fetch(request: Request, env: SignerEnv): Promise<Response> {
    const unauthorized = requireInternalAuth(request, env);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === signerPath("createChallenge") && request.method === "POST") {
        const body = (await request.json()) as { origin?: string };
        const origin =
          body.origin ?? request.headers.get("origin") ?? "Unknown app";
        return json(await handleCreateChallenge(env, origin));
      }

      if (path === signerPath("getChallenge") && request.method === "GET") {
        const requestId = url.searchParams.get("requestId")?.trim();
        if (!requestId) return errorResponse("Missing request", 400);
        const status = await handleGetChallengeStatus(env, requestId);
        if (!status) return errorResponse(SIGNER_REQUEST_EXPIRED, 410);
        return json(status);
      }

      if (path === signerPath("peekChallenge") && request.method === "POST") {
        const body = (await request.json()) as { requestId?: string };
        if (!body.requestId) return errorResponse("Missing request", 400);
        const peek = await handlePeekChallenge(env, body.requestId);
        if (!peek) return errorResponse(SIGNER_REQUEST_EXPIRED, 410);
        return json(peek);
      }

      if (path === signerPath("createSessionKey") && request.method === "POST") {
        return json(await handleCreateSessionKey(env, await request.json()));
      }

      if (path === signerPath("destroySessionKey") && request.method === "POST") {
        return json(await handleDestroySessionKey(env, await request.json()));
      }

      if (path === signerPath("provisionFeePayerKey") && request.method === "POST") {
        const body = (await request.json()) as { secretKey?: string };
        return json(await provisionFeePayerKey(env, body.secretKey ?? ""));
      }

      if (path === signerPath("getFeePayerPublicKey") && request.method === "GET") {
        const row = await getFeePayerPublicKey(env);
        if (!row) {
          throw new SignerError("Fee payer is not provisioned.", 404);
        }
        return json(row);
      }

      if (path === signerPath("signSession") && request.method === "POST") {
        return json(await handleSignSession(env, await request.json()));
      }

      if (path === signerPath("signFeePayer") && request.method === "POST") {
        return json(await handleSignFeePayer(env, await request.json()));
      }

      if (path === "/" || path === "") {
        return json({ service: "phygital-payments-signer", version: "v1" });
      }

      return errorResponse("Not found", 404);
    } catch (error) {
      return mapHandlerError(error);
    }
  },
};
