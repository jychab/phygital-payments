import type { JobStatus, SponsoredJob } from "./submitter-wire";

/** WebAuthn assertion JSON (subset used by completeTransfer). */
export type ClaimAuthWire = {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string;
  };
  authenticatorAttachment?: string;
  clientExtensionResults: Record<string, unknown>;
  type: string;
};

export type SubmitClaimRequest = {
  asset: string;
  /** u64 decimal — SlotHashes slot bound into the WebAuthn challenge. */
  slotNumber: string;
  recipient: string;
  auth: ClaimAuthWire;
  createdAtMs?: number;
  /** Hash of auth signature — same tap resumes the same job. */
  idempotencyKey?: string;
};

export type ClaimJob = SponsoredJob;

export type ClaimJobStatusResponse = {
  job: ClaimJob;
};

export type { JobStatus, SponsoredJob };
