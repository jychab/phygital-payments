/** Client wire types — keep in sync with worker/src/types.ts */

export type BytesBase64 = string;

export type Secp256r1VerifyEntryWire = {
  publicKey: BytesBase64;
  signature: BytesBase64;
  message: BytesBase64;
};

export type TransferAccountsWire = {
  asset: string;
  mint: string;
  recipient: string;
  programAuthority: string;
  senderTokenAccount: string;
  recipientTokenAccount: string;
  tokenProgram: string;
  amount: string;
  slotNumber: string;
  clientDataJson: BytesBase64;
};

export type SubmitTransferRequest = {
  secpEntry: Secp256r1VerifyEntryWire;
  transfer: TransferAccountsWire;
  createdAtMs?: number;
};

export type SubmitTransferResponse = {
  jobId: string;
};

export type JobStatus = "queued" | "submitted" | "confirmed" | "failed";

export type TransferJob = {
  id: string;
  createdAtMs: number;
  slotNumber: string;
  secpEntry: Secp256r1VerifyEntryWire;
  transfer: TransferAccountsWire;
  status: JobStatus;
  signature?: string;
  error?: string;
};

export type JobStatusResponse = {
  job: TransferJob;
};

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}
