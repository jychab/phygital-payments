import { NextResponse } from "next/server";

import {
  consumePendingClaim,
  readPendingClaim,
  writePendingClaim,
} from "@/lib/claim/pending-claim-store";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import {
  parseCreatePendingClaimRequest,
  type CreatePendingClaimResponse,
} from "../../../../../shared/pending-claim-wire";

function finishPath(token: string): string {
  return `/device/finish?token=${encodeURIComponent(token)}`;
}

function absoluteFinishUrl(req: Request, token: string): string {
  const origin = new URL(req.url).origin;
  return `${origin}${finishPath(token)}`;
}

function tokenFromRequest(req: Request): string | null {
  return new URL(req.url).searchParams.get("token")?.trim() || null;
}

/** Store a tap proof for wallet-browser finish (SlotHashes TTL). */
export async function POST(req: Request) {
  try {
    const body = parseCreatePendingClaimRequest(await req.json());
    if (!body) {
      return NextResponse.json(
        { error: "Invalid pending claim payload" },
        { status: 400 },
      );
    }

    const token = crypto.randomUUID();
    const stored = await writePendingClaim({
      token,
      record: body,
    });

    const response: CreatePendingClaimResponse = {
      token,
      finishUrl: absoluteFinishUrl(req, token),
      expiresAtMs: stored.expiresAtMs,
    };
    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      {
        error: toUserErrorMessage(
          err,
          "Couldn’t save your tap. Try holding the NFC device again.",
        ),
      },
      { status: 500 },
    );
  }
}

/** Load a pending tap proof for the finish page. */
export async function GET(req: Request) {
  try {
    const token = tokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const record = await readPendingClaim(token);
    if (!record) {
      return NextResponse.json(
        {
          error:
            "This tap proof expired or was already used. Tap your NFC device again in Safari.",
        },
        { status: 410 },
      );
    }

    return NextResponse.json(record);
  } catch (err) {
    return NextResponse.json(
      {
        error: toUserErrorMessage(
          err,
          "Couldn’t load your tap proof. Try again.",
        ),
      },
      { status: 500 },
    );
  }
}

/** Delete a pending tap proof after a confirmed claim tx. */
export async function DELETE(req: Request) {
  try {
    const token = tokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const consumed = await consumePendingClaim(token);
    if (!consumed) {
      return NextResponse.json(
        { error: "Tap proof expired or already used." },
        { status: 410 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error: toUserErrorMessage(err, "Couldn’t finalize the tap session."),
      },
      { status: 500 },
    );
  }
}
