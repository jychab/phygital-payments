import { importSPKI, jwtVerify, type JWTPayload } from "jose";

export type PrivySession = {
  userId: string;
  sessionId?: string;
};

function getCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

function getBearer(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice("Bearer ".length).trim() || null;
}

/** Privy config subset needed to verify an access token. */
export type PrivyAuthConfig = {
  PRIVY_APP_ID: string;
  PRIVY_VERIFICATION_KEY: string;
};

/** Extract Privy access token from `privy-token` cookie (preferred) or Bearer. */
export function extractPrivyAccessToken(request: Request): string | null {
  return getCookie(request, "privy-token") ?? getBearer(request);
}

export async function verifyPrivyAccessToken(
  token: string,
  env: PrivyAuthConfig,
): Promise<PrivySession> {
  const appId = env.PRIVY_APP_ID?.trim();
  const pem = env.PRIVY_VERIFICATION_KEY?.trim().replace(/\\n/g, "\n");
  if (!appId || !pem) {
    throw new AuthError("Privy auth is not configured");
  }

  const key = await importSPKI(pem, "ES256");
  const { payload } = await jwtVerify(token, key, {
    issuer: "privy.io",
    audience: appId,
  });

  const userId = claimString(payload, "sub");
  if (!userId) {
    throw new AuthError("Invalid Privy token: missing sub");
  }

  return {
    userId,
    sessionId: claimString(payload, "sid") ?? undefined,
  };
}

function claimString(payload: JWTPayload, key: string): string | null {
  const value = payload[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export class AuthError extends Error {
  readonly status = 401;
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/** Require a valid Privy session or throw AuthError. */
export async function requirePrivySession(
  request: Request,
  env: PrivyAuthConfig,
): Promise<PrivySession> {
  const token = extractPrivyAccessToken(request);
  if (!token) {
    throw new AuthError("Missing Privy session cookie (privy-token)");
  }
  try {
    return await verifyPrivyAccessToken(token, env);
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError("Invalid or expired Privy session");
  }
}
