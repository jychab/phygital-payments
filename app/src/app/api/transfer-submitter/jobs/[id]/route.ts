import { NextRequest, NextResponse } from "next/server";

import { getSubmitterStub } from "@/lib/server/submitter";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;

    const stub = getSubmitterStub();
    const wait = req.nextUrl.searchParams.get("wait") === "1";
    const job = wait ? await stub.waitForJob(id) : await stub.getJob(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ job });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
