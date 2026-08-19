import { NextRequest, NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import { getSubmitterStub } from "@/lib/server/settle-do";

/** GET /api/transfer-submitter/jobs/:id — long-poll until terminal (or timeout). */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const job = await getSubmitterStub().waitForJob(id);
    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404, headers: QUERY_NO_STORE },
      );
    }
    return NextResponse.json({ job }, { headers: QUERY_NO_STORE });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: QUERY_NO_STORE },
    );
  }
}
