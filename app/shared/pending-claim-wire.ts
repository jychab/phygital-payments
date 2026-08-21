/**
 * Wire types for claim handoff (Safari NFC tap → `/accessory?token=`).
 */

import { getBase58Decoder, getBase58Encoder } from "@solana/kit";
import type { TransferSession } from "phygital-token-sdk";

type AuthenticationResponseJSON = Awaited<
  ReturnType<typeof import("phygital-token-sdk").authenticatePasskeyForTransfer>
>;

/** JSON-safe `Omit<TransferSession, "rpc">` (KV / API). */
export type PendingClaimSessionJson = {
  token: string;
  slotNumber: string;
  slotHash: string;
  challenge: string;
};

export type PendingClaimRecord = {
  session: PendingClaimSessionJson;
  auth: AuthenticationResponseJSON;
  createdAtMs: number;
};

export type PendingClaimView = PendingClaimRecord & {
  expiresAtMs: number;
};

export type CreatePendingClaimResponse = {
  token: string;
  expiresAtMs: number;
};

export function serializePendingClaimSession(
  session: TransferSession,
): PendingClaimSessionJson {
  return {
    token: session.token.toString(),
    slotNumber: session.slotNumber.toString(),
    slotHash: getBase58Decoder().decode(session.slotHash),
    challenge: getBase58Decoder().decode(session.challenge),
  };
}

function parseSession(value: unknown): PendingClaimSessionJson | null {
  if (!value || typeof value !== "object") return null;
  const o = value as Record<string, unknown>;
  if (typeof o.token !== "string" || !o.token.trim()) return null;
  if (typeof o.slotNumber !== "string" || !o.slotNumber.trim()) return null;
  if (typeof o.slotHash !== "string" || !o.slotHash.trim()) return null;
  if (typeof o.challenge !== "string" || !o.challenge.trim()) return null;

  return {
    token: o.token.trim(),
    slotNumber: o.slotNumber.trim(),
    slotHash: o.slotHash.trim(),
    challenge: o.challenge.trim(),
  };
}

function parseAuth(value: unknown): AuthenticationResponseJSON | null {
  if (!value || typeof value !== "object") return null;
  const auth = value as Record<string, unknown>;
  if (typeof auth.id !== "string" || typeof auth.rawId !== "string") return null;
  if (auth.type !== "public-key") return null;
  if (!auth.response || typeof auth.response !== "object") return null;
  const response = auth.response as Record<string, unknown>;
  if (
    typeof response.authenticatorData !== "string" ||
    typeof response.clientDataJSON !== "string" ||
    typeof response.signature !== "string"
  ) {
    return null;
  }
  return auth as AuthenticationResponseJSON;
}

function parsePayload(
  o: Record<string, unknown>,
): Omit<PendingClaimRecord, "createdAtMs"> | null {
  const session = parseSession(o.session);
  const auth = parseAuth(o.auth);
  if (!session || !auth) return null;
  return { session, auth };
}

/** Validate POST body before KV write. */
export function parseCreatePendingClaimRequest(
  body: unknown,
): Omit<PendingClaimRecord, "createdAtMs"> | null {
  if (!body || typeof body !== "object") return null;
  return parsePayload(body as Record<string, unknown>);
}

/** Validate stored KV JSON. */
export function parsePendingClaimRecord(raw: unknown): PendingClaimRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const payload = parsePayload(o);
  if (!payload) return null;
  if (typeof o.createdAtMs !== "number" || !Number.isFinite(o.createdAtMs)) {
    return null;
  }
  return { ...payload, createdAtMs: o.createdAtMs };
}
