import { NextRequest, NextResponse } from "next/server";

import type { SubmitTransferRequest } from "@/lib/payments/submitter-types";
import {
  AuthError,
  getSubmitterStub,
  requirePrivySession,
} from "@/lib/server/submitter";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(req: NextRequest) {
  try {
    const session = await requirePrivySession(req, getCloudflareContext().env);

    const body = (await req.json()) as SubmitTransferRequest;
    if (!body?.secpEntry || !body?.transfer) {
      return NextResponse.json(
        { error: "Invalid payload: secpEntry and transfer required" },
        { status: 400 },
      );
    }

    const stub = getSubmitterStub();
    const { jobId } = await stub.enqueue(body, session.userId);
    return NextResponse.json({ jobId }, { status: 202 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
