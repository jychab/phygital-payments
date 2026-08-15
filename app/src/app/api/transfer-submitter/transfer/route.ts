import { NextRequest, NextResponse } from "next/server";

import type { SubmitTransferRequest } from "@/lib/payments/submitter-types";
import { getSubmitterStub } from "@/lib/server/submitter";

/**
 * POST /api/transfer-submitter/transfer
 * Always holds until the job is confirmed/failed (or the DO wait times out).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubmitTransferRequest;
    if (!body?.secpEntry || !body?.transfer) {
      return NextResponse.json(
        { error: "Invalid payload: secpEntry and transfer required" },
        { status: 400 },
      );
    }

    const job = await getSubmitterStub().enqueueAndWait(body);
    if (job.status === "failed") {
      return NextResponse.json(
        { jobId: job.id, job, error: job.error ?? "Sponsored transfer failed" },
        { status: 502 },
      );
    }
    if (job.status !== "confirmed" || !job.signature) {
      // Hold timed out while still in-flight — client can resume via job poll.
      return NextResponse.json({ jobId: job.id, job }, { status: 202 });
    }
    return NextResponse.json({ jobId: job.id, job, signature: job.signature });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
