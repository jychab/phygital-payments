import { NextResponse } from "next/server";

import { getSubmitterStub } from "@/lib/server/settle-do";

export const runtime = "nodejs";

/** GET /api/claim/jobs/:id — long-poll claim job until terminal (or timeout). */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing job id" }, { status: 400 });
  }
  try {
    const job = await getSubmitterStub().waitForClaimJob(id.trim());
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ job });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
