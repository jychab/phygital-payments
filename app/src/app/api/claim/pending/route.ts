import { NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import {
  consumePendingClaim,
  readPendingClaim,
  writePendingClaim,
} from "@/lib/device/pending-claim-store";
import { toUserErrorMessage } from "@/lib/user-errors";
import { deviceClaimHref } from "@/lib/device/claim";
import {
  parseCreatePendingClaimRequest,
  type CreatePendingClaimResponse,
} from "../../../../../shared/pending-claim-wire";

function absoluteFinishUrl(req: Request, token: string): string {
  const origin = new URL(req.url).origin;
  return `${origin}${deviceClaimHref(token)}`;
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
          "Couldn’t save this. Hold your device to your phone again.",
        ),
      },
      { status: 500 },
    );
  }
}

/** Load a pending tap proof for `/device?token=`. */
export async function GET(req: Request) {
  try {
    const token = tokenFromRequest(req);
    if (!token) {
      return NextResponse.json(
        { error: "Missing token" },
        { status: 400, headers: QUERY_NO_STORE },
      );
    }

    const record = await readPendingClaim(token);
    if (!record) {
      return NextResponse.json(
        {
          error:
          error:
            "This expired. Hold your device to your phone again.",
        },
        { status: 410, headers: QUERY_NO_STORE },
      );
    }

    return NextResponse.json(record, { headers: QUERY_NO_STORE });
  } catch (err) {
    return NextResponse.json(
      {
        error: toUserErrorMessage(
          err,
          "Couldn’t load this. Try again.",
        ),
      },
      { status: 500, headers: QUERY_NO_STORE },
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
