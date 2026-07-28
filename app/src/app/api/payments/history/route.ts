import { NextRequest, NextResponse } from "next/server";

import {
  ensurePaymentsSchema,
  getPaymentsDb,
  getPaymentsForOwner,
} from "@/lib/server/payments-db";

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

// Public, address-keyed lookup of indexed on-chain payments. The data is
// already public on-chain, so no session is required.
export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address")?.trim() ?? "";
    if (!BASE58_RE.test(address)) {
      return NextResponse.json(
        { error: "Valid `address` query param is required" },
        { status: 400 },
      );
    }

    const limitRaw = Number(req.nextUrl.searchParams.get("limit") ?? "50");
    const beforeRaw = req.nextUrl.searchParams.get("before");
    const beforeBlockTime = beforeRaw != null ? Number(beforeRaw) : undefined;

    const db = getPaymentsDb();
    await ensurePaymentsSchema(db);
    const payments = await getPaymentsForOwner(db, address, {
      limit: Number.isFinite(limitRaw) ? limitRaw : 50,
      beforeBlockTime:
        beforeBlockTime != null && Number.isFinite(beforeBlockTime)
          ? beforeBlockTime
          : undefined,
    });

    return NextResponse.json({ address, payments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
