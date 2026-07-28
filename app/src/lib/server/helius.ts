import "server-only";

import {
  fixDecoderSize,
  getAddressDecoder,
  getBase64Encoder,
  getBytesDecoder,
  getI64Decoder,
  getStructDecoder,
  getU64Decoder,
} from "@solana/kit";

import type { PaymentRecord } from "@/lib/server/payments-db";

// --- Program `TransferEvent` (from the payments IDL) ------------------------
// emit! writes the event as a `Program data: <base64>` log line: an 8-byte
// discriminator followed by the Borsh-encoded struct.

const TRANSFER_EVENT_DISCRIMINATOR = Uint8Array.from([
  100, 10, 46, 113, 8, 28, 179, 125,
]);

const transferEventDecoder = getStructDecoder([
  ["recipient", getAddressDecoder()],
  ["owner", getAddressDecoder()],
  ["publicKey", fixDecoderSize(getBytesDecoder(), 33)],
  ["mint", getAddressDecoder()],
  ["amount", getU64Decoder()],
  ["time", getI64Decoder()],
]);

const PROGRAM_DATA_PREFIX = "Program data: ";
const base64 = getBase64Encoder();

// --- Helius raw (transaction) webhook payload (only fields we read) ---------

type RawTransaction = {
  slot?: number;
  blockTime?: number | null;
  meta?: {
    err?: unknown;
    logMessages?: string[] | null;
  } | null;
  transaction?: { signatures?: string[] } | null;
  signature?: string;
};

function discriminatorMatches(bytes: Uint8Array): boolean {
  if (bytes.length < 8) return false;
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== TRANSFER_EVENT_DISCRIMINATOR[i]) return false;
  }
  return true;
}

type DecodedTransferEvent = {
  recipient: string;
  owner: string;
  mint: string;
  amount: bigint;
  time: bigint;
};

/** Decode every TransferEvent emitted in a transaction's program logs. */
function extractTransferEvents(logs: string[]): DecodedTransferEvent[] {
  const events: DecodedTransferEvent[] = [];
  for (const line of logs) {
    if (!line.startsWith(PROGRAM_DATA_PREFIX)) continue;
    const payload = line.slice(PROGRAM_DATA_PREFIX.length).trim();

    let bytes: Uint8Array;
    try {
      bytes = new Uint8Array(base64.encode(payload));
    } catch {
      continue;
    }
    if (!discriminatorMatches(bytes)) continue;

    try {
      const decoded = transferEventDecoder.decode(bytes.slice(8));
      events.push({
        recipient: decoded.recipient,
        owner: decoded.owner,
        mint: decoded.mint,
        amount: decoded.amount,
        time: decoded.time,
      });
    } catch {
      // Not a well-formed TransferEvent — skip.
    }
  }
  return events;
}

function signatureOf(tx: RawTransaction): string | null {
  return tx.transaction?.signatures?.[0] ?? tx.signature ?? null;
}

/**
 * Parse a Helius raw (transaction) webhook body into payment records by
 * decoding the program's TransferEvent from each transaction's logs. One record
 * per event (a batched sponsored tx emits several), keyed by (signature, index).
 */
export function parseTransferEvents(body: unknown): PaymentRecord[] {
  const txs: RawTransaction[] = Array.isArray(body)
    ? (body as RawTransaction[])
    : body && typeof body === "object"
      ? [body as RawTransaction]
      : [];

  const records: PaymentRecord[] = [];

  for (const tx of txs) {
    const signature = signatureOf(tx);
    if (!signature) continue;
    if (tx.meta?.err != null) continue; // skip failed transactions

    const logs = tx.meta?.logMessages ?? [];
    extractTransferEvents(logs).forEach((ev, index) => {
      records.push({
        signature,
        transferIndex: index,
        slot: tx.slot ?? null,
        blockTime: Number(ev.time) || tx.blockTime || null,
        mint: ev.mint,
        amount: ev.amount.toString(),
        senderOwner: ev.owner,
        recipientOwner: ev.recipient,
        // The event carries wallet owners, not token accounts.
        senderTokenAccount: null,
        recipientTokenAccount: null,
      });
    });
  }

  return records;
}
