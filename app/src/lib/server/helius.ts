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
const BASE58_SIGNATURE = /^[1-9A-HJ-NP-Za-km-z]{64,88}$/;
const base64 = getBase64Encoder();

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
    if (typeof line !== "string" || !line.startsWith(PROGRAM_DATA_PREFIX)) {
      continue;
    }
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function asSignature(value: unknown): string | null {
  if (typeof value !== "string" || !BASE58_SIGNATURE.test(value)) return null;
  return value;
}

function signaturesFrom(value: unknown): string | null {
  if (!isRecord(value)) return null;
  if (Array.isArray(value.signatures)) return asSignature(value.signatures[0]);
  return asSignature(value.signature);
}

function logMessagesFrom(value: unknown): string[] | null {
  if (!isRecord(value)) return null;
  const logs = value.logMessages;
  if (!Array.isArray(logs)) return null;
  return logs.filter((line): line is string => typeof line === "string");
}

function metaFrom(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null;
  if (isRecord(value.meta)) return value.meta;
  // Encoded tx tuple used by some raw encodings: [transaction, meta]
  if (Array.isArray(value.transaction) && isRecord(value.transaction[1])) {
    return value.transaction[1];
  }
  return null;
}

/**
 * Helius delivers raw webhooks in several historically-used shapes:
 * documented `{ meta, transaction }`, RPC `getTransaction`, geyser/LaserStream
 * `{ transaction: { transaction, meta } }`, and `[tx, meta]` tuples. Pull
 * signature / logs / err from all of those paths.
 */
function flattenTx(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null;
  const inner = isRecord(value.transaction) ? value.transaction : null;
  // Geyser: { transaction: { transaction, meta, signature }, slot }
  if (inner && (isRecord(inner.transaction) || isRecord(inner.meta))) {
    return { ...inner, ...value, transaction: inner.transaction ?? inner };
  }
  return value;
}

function signatureOf(tx: Record<string, unknown>): string | null {
  return (
    asSignature(tx.signature) ??
    signaturesFrom(tx.transaction) ??
    signaturesFrom(tx) ??
    (Array.isArray(tx.transaction) ? signaturesFrom(tx.transaction[0]) : null)
  );
}

function logsOf(tx: Record<string, unknown>): string[] {
  return (
    logMessagesFrom(metaFrom(tx)) ??
    logMessagesFrom(tx) ??
    logMessagesFrom(isRecord(tx.transaction) ? tx.transaction : null) ??
    logMessagesFrom(
      isRecord(tx.transaction) ? metaFrom(tx.transaction) : null,
    ) ??
    []
  );
}

function errOf(tx: Record<string, unknown>): unknown {
  const meta = metaFrom(tx);
  if (meta && "err" in meta) return meta.err;
  if ("err" in tx) return tx.err;
  if ("transactionError" in tx) return tx.transactionError;
  const inner = isRecord(tx.transaction) ? tx.transaction : null;
  if (inner && isRecord(inner.meta) && "err" in inner.meta) return inner.meta.err;
  return null;
}

function asInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Helius POSTs an array of transactions. Also accept a single tx, a JSON-RPC
 * `transactionNotification`, `{ result: ... }`, or a double-encoded JSON string.
 */
function webhookTransactions(body: unknown): Record<string, unknown>[] {
  if (typeof body === "string") {
    try {
      return webhookTransactions(JSON.parse(body));
    } catch {
      return [];
    }
  }
  if (Array.isArray(body)) {
    return body.flatMap((item) => {
      const tx = flattenTx(item);
      return tx ? [tx] : [];
    });
  }
  if (!isRecord(body)) return [];

  if (isRecord(body.params) && body.params.result !== undefined) {
    return webhookTransactions(body.params.result);
  }
  if (
    body.result !== undefined &&
    !("transaction" in body) &&
    !("meta" in body)
  ) {
    return webhookTransactions(body.result);
  }

  const tx = flattenTx(body);
  return tx ? [tx] : [];
}

/**
 * Parse a Helius raw (transaction) webhook body into payment records by
 * decoding the program's TransferEvent from each transaction's logs. One record
 * per event (a batched sponsored tx emits several), keyed by (signature, index).
 */
export function parseTransferEvents(body: unknown): PaymentRecord[] {
  const records: PaymentRecord[] = [];

  for (const raw of webhookTransactions(body)) {
    const signature = signatureOf(raw);
    if (!signature) continue;
    if (errOf(raw) != null) continue; // skip failed transactions

    const slot = asInt(raw.slot);
    const blockTime = asInt(raw.blockTime) ?? asInt(raw.timestamp);

    extractTransferEvents(logsOf(raw)).forEach((ev, index) => {
      records.push({
        signature,
        transferIndex: index,
        slot,
        blockTime: asInt(ev.time) ?? blockTime,
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
