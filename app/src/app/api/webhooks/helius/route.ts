import { NextRequest, NextResponse } from "next/server";

import { parseTransferEvents } from "@/lib/server/helius";
import {
  ensurePaymentsSchema,
  getPaymentsDb,
  insertPayments,
  type PaymentRecord,
} from "@/lib/server/payments-db";
import { getPreauthGrantsStub } from "@/lib/server/preauth-grants-do";
import type { GrantPaymentStamp } from "../../../../../worker/preauth-grant-types";

/** Strip an optional `Bearer ` prefix so dashboard vs API authHeader both match. */
function authToken(value: string): string {
  return value.trim().replace(/^Bearer\s+/i, "").trim();
}

/** Timing-safe string compare. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Helius raw (transaction) webhook receiver. Configure the webhook (operator
 * task) to POST here, scoped to the payments program, with an `Authorization`
 * header equal to HELIUS_WEBHOOK_AUTH. Decodes the program's TransferEvent from
 * each transaction's logs and indexes the payments to D1.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.HELIUS_WEBHOOK_AUTH?.trim();

  if (!expected) {
    return NextResponse.json(
      { error: "Webhook auth not configured" },
      { status: 503 },
    );
  }
  const provided = authToken(req.headers.get("authorization") ?? "");
  if (!safeEqual(provided, authToken(expected))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const records = parseTransferEvents(body);
  if (records.length === 0) {
    return NextResponse.json({ indexed: 0 });
  }

  try {
    const db = getPaymentsDb();
    await ensurePaymentsSchema(db);
    await Promise.all([
      insertPayments(db, records),
      stampPreauthGrants(records),
    ]);
  } catch (error) {
    // Return 5xx so Helius retries delivery.
    const message = error instanceof Error ? error.message : "Indexing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ indexed: records.length });
}

/** One DO RPC per unique payer. Failure must 500 so Helius retries the stamp. */
async function stampPreauthGrants(records: PaymentRecord[]): Promise<void> {
  const stamps = uniqueSenderStamps(records);
  if (stamps.length === 0) return;
  await Promise.all(
    stamps.map(({ wallet, stamp }) =>
      getPreauthGrantsStub(wallet).recordPayment(stamp),
    ),
  );
}

function uniqueSenderStamps(
  records: PaymentRecord[],
): { wallet: string; stamp: GrantPaymentStamp }[] {
  const seen = new Set<string>();
  const stamps: { wallet: string; stamp: GrantPaymentStamp }[] = [];
  for (const row of records) {
    const wallet = row.senderOwner;
    if (!wallet || !row.recipientOwner) continue;
    if (seen.has(wallet)) continue;
    seen.add(wallet);
    stamps.push({
      wallet,
      stamp: {
        blockTime: row.blockTime,
        recipient: row.recipientOwner,
        amount: row.amount,
        mint: row.mint,
        signature: row.signature,
      },
    });
  }
  return stamps;
}
