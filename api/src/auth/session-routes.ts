import { Hono } from "hono";

import { json } from "@/shared/http";
import {
  type AuthenticationResponseJSON,
  verifyPasskeyAndResolveToken,
} from "@/auth/passkey-verify";
import {
  mintSessionToken,
  readSessionCookie,
  setSessionCookie,
} from "@/auth/token-session";

export const authSessionRoutes = new Hono();

/** HttpOnly session for one phygital token, if still valid. */
authSessionRoutes.get("/auth/token-session", async (c) => {
  const phygitalToken = c.req.query("phygitalToken")?.trim();
  if (!phygitalToken) {
    return json(
      { error: "phygitalToken required", code: "invalid_transaction" },
      { status: 400 },
    );
  }
  const session = await readSessionCookie(c, { phygitalToken });
  if (!session) {
    return json(
      { error: "Hold your item to continue.", code: "session_required" },
      { status: 401 },
    );
  }
  return json({
    phygitalToken: session.phygitalToken,
    secp256r1PublicKey: session.secp256r1PublicKey,
    expiresAt: session.exp,
  });
});

authSessionRoutes.post("/auth/token-session", async (c) => {
  try {
    const body = (await c.req.json()) as {
      message?: string;
      response?: AuthenticationResponseJSON;
    };
    if (!body.message || !body.response) {
      return json(
        { error: "message and response required", code: "session_required" },
        { status: 400 },
      );
    }

    const verified = await verifyPasskeyAndResolveToken({
      message: body.message,
      response: body.response,
    });
    if (!verified.ok) {
      return json(
        { error: verified.error, code: "passkey_invalid" },
        { status: verified.status },
      );
    }

    const { token, expiresAt } = await mintSessionToken({
      phygitalToken: verified.phygitalToken,
      secp256r1PublicKey: verified.secp256r1PublicKey,
    });
    setSessionCookie(c, token, expiresAt, verified.phygitalToken);

    return json({
      phygitalToken: verified.phygitalToken,
      secp256r1PublicKey: verified.secp256r1PublicKey,
      expiresAt,
    });
  } catch (err) {
    return json(
      {
        error: err instanceof Error ? err.message : "Could not mint session",
        code: "session_required",
      },
      { status: 400 },
    );
  }
});
