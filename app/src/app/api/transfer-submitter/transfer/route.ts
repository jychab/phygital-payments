import { NextRequest, NextResponse } from "next/server";

import type { SubmitTransferRequest } from "@/lib/payments/submitter-types";
import { getSubmitterStub } from "@/lib/server/submitter";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubmitTransferRequest;
    if (!body?.secpEntry || !body?.transfer) {
      return NextResponse.json(
        { error: "Invalid payload: secpEntry and transfer required" },
        { status: 400 },
      );
    }

    const stub = getSubmitterStub();
    const { jobId } = await stub.enqueue(body);
    return NextResponse.json({ jobId }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
