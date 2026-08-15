import { NextResponse } from "next/server";

type SponsoredJobLike = {
  id: string;
  status: string;
  signature?: string;
  error?: string;
};

/** Shared 200 / 202 / 502 shaping for claim + transfer submit routes. */
export function jsonForSponsoredJob(
  job: SponsoredJobLike,
  failedMessage?: string,
): NextResponse {
  if (job.status === "failed") {
    return NextResponse.json(
      {
        jobId: job.id,
        job,
        error: failedMessage ?? job.error ?? "Sponsored submit failed",
      },
      { status: 502 },
    );
  }
  if (job.status !== "confirmed" || !job.signature) {
    return NextResponse.json({ jobId: job.id, job }, { status: 202 });
  }
  return NextResponse.json({
    jobId: job.id,
    job,
    signature: job.signature,
  });
}
