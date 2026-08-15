import { NextResponse } from "next/server";

import type { SubmitClaimRequest } from "../../../../shared/claim-wire";
import { getSubmitterStub } from "@/lib/server/submitter";
import { jsonForSponsoredJob } from "@/lib/server/sponsored-job-response";
import { toUserErrorMessage } from "@/lib/payments/user-errors";

export const runtime = "nodejs";

/** POST /api/claim — sponsored ownership claim via TransferSubmitterDO. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SubmitClaimRequest;
    const job = await getSubmitterStub().enqueueClaimAndWait(body);
    return jsonForSponsoredJob(
      job,
      toUserErrorMessage(job.error, "Couldn’t add this NFC device. Try again."),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: toUserErrorMessage(
          error,
          "Couldn’t add this NFC device. Try again.",
        ),
      },
      { status: 500 },
    );
  }
}
