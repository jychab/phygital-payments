/**
 * Shared submitter wire types (Next client ↔ fee-payer Durable Object).
 * Import from here — do not duplicate in client or worker modules.
 */

export type BytesBase64 = string;

export type Secp256r1VerifyEntryWire = {
  publicKey: BytesBase64;
  signature: BytesBase64;
  message: BytesBase64;
};

export type TransferAccountsWire = {
  asset: string;
  /** Asset owner wallet — used for preauth grant lookup and owner_verifier PDA. */
  owner: string;
  mint: string;
  recipient: string;
  programAuthority: string;
  senderTokenAccount: string;
  recipientTokenAccount: string;
  tokenProgram: string;
  /** OwnerVerifier PDA (may be uninitialized on-chain). */
  ownerVerifier: string;
  /** Config PDA. */
  config: string;
  /** u64 decimal string */
  amount: string;
  /** Slot bound into the WebAuthn challenge via SlotHashes (u64 decimal). */
  slotNumber: string;
  clientDataJson: BytesBase64;
};

export type SubmitTransferRequest = {
  secpEntry: Secp256r1VerifyEntryWire;
  transfer: TransferAccountsWire;
  /** Client-side createdAt for freshness checks (ms). */
  createdAtMs?: number;
  /**
   * Stable key for this WebAuthn assertion (e.g. hash of secp signature).
   * Re-POSTs after a network blip resume the same job instead of double-claiming.
   */
  idempotencyKey?: string;
};

export type JobStatus = "queued" | "submitted" | "confirmed" | "failed";

export type TransferJob = {
  id: string;
  createdAtMs: number;
  slotNumber: string;
  secpEntry: Secp256r1VerifyEntryWire;
  transfer: TransferAccountsWire;
  status: JobStatus;
  /** Flush attempts so far (worker-only; clients may omit). */
  attempts: number;
  signature?: string;
  error?: string;
};

export type JobStatusResponse = {
  job: TransferJob;
};
