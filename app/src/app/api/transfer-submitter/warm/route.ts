import { NextResponse } from "next/server";

import { getSubmitterStub } from "@/lib/server/submitter";

/**
 * Pre-warm the sponsored-transfer DO (fee-payer signer + blockhash) so the
 * actual submit hits a hot object. Fire-and-forget from the client when the
 * receive panel is armed; failures are non-fatal.
 */
export async function POST() {
  try {
    await getSubmitterStub().warm();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
