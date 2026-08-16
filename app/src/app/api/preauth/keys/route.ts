import { NextRequest, NextResponse } from "next/server";

import {
  getPreauthDb,
  issueWalletApiKey,
  revokeWalletApiKey,
} from "@/lib/server/presence-grants-db";

function assertOpsAuth(req: NextRequest): NextResponse | null {
  const expected = process.env.PREAUTH_OPS_SECRET?.trim();
  if (!expected) {
    return NextResponse.json(
      { error: "PREAUTH_OPS_SECRET is not configured" },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(auth);
  if (!match?.[1] || match[1].trim() !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * POST /api/preauth/keys  { wallet }
 * Authorization: Bearer <PREAUTH_OPS_SECRET>
 * Issues (or rotates) a long-lived API key for the wallet. Raw key returned once.
 */
export async function POST(req: NextRequest) {
  const denied = assertOpsAuth(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as { wallet?: string };
    const wallet = body.wallet?.trim();
    if (!wallet) {
      return NextResponse.json({ error: "wallet is required" }, { status: 400 });
    }
    const { apiKey } = await issueWalletApiKey(getPreauthDb(), wallet);
    return NextResponse.json({ wallet, apiKey });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/preauth/keys?wallet=
 * Authorization: Bearer <PREAUTH_OPS_SECRET>
 */
export async function DELETE(req: NextRequest) {
  const denied = assertOpsAuth(req);
  if (denied) return denied;

  try {
    const wallet = req.nextUrl.searchParams.get("wallet")?.trim();
    if (!wallet) {
      return NextResponse.json({ error: "wallet query is required" }, { status: 400 });
    }
    const revoked = await revokeWalletApiKey(getPreauthDb(), wallet);
    return NextResponse.json({ wallet, revoked });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
