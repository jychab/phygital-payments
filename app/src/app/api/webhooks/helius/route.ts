import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { parseTransferEvents } from "@/lib/server/helius";
import {
  ensurePaymentsSchema,
  getPaymentsDb,
  insertPayments,
} from "@/lib/server/payments-db";

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
  const expected = (
    getCloudflareContext().env as unknown as { HELIUS_WEBHOOK_AUTH?: string }
  ).HELIUS_WEBHOOK_AUTH?.trim();

  if (!expected) {
    return NextResponse.json(
      { error: "Webhook auth not configured" },
      { status: 503 },
    );
  }
  const provided = req.headers.get("authorization")?.trim() ?? "";
  if (!safeEqual(provided, expected)) {
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
    await insertPayments(db, records);
  } catch (error) {
    // Return 5xx so Helius retries delivery.
    const message = error instanceof Error ? error.message : "Indexing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ indexed: records.length });
}
