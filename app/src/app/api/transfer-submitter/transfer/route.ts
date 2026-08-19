import { NextRequest, NextResponse } from "next/server";

import type { SubmitTransferRequest } from "@/lib/collect/settle-types";
import { getSubmitterStub } from "@/lib/server/settle-do";
import { jsonForSponsoredJob } from "@/lib/server/sponsored-job-response";

export const runtime = "nodejs";

/** POST /api/transfer-submitter/transfer */
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
    return jsonForSponsoredJob(
      job,
      job.error ?? "Sponsored transfer failed",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
