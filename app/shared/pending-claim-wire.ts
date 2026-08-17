/**
 * Wire types for two-step claim handoff (Safari NFC tap → wallet finish).
 */

/** Stored WebAuthn assertion from `authenticatePasskeyForTransfer`. */
export type ClaimAuthWire = Awaited<
  ReturnType<typeof import("phygital-token-sdk").authenticatePasskeyForTransfer>
>;

/** KV payload — expiry is derived from `createdAtMs`. */
export type PendingClaimRecord = {
  asset: string;
  /** u64 decimal string bound at tap time. */
  slotNumber: string;
  auth: ClaimAuthWire;
  createdAtMs: number;
};

/** API response with derived wall-clock expiry. */
export type PendingClaimView = PendingClaimRecord & {
  expiresAtMs: number;
};

export type CreatePendingClaimRequest = {
  asset: string;
  slotNumber: string;
  auth: ClaimAuthWire;
};

export type CreatePendingClaimResponse = {
  token: string;
  finishUrl: string;
  expiresAtMs: number;
};
