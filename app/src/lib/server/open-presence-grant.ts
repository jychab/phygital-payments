import "server-only";

import { NextResponse } from "next/server";

import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { getErrorMessage } from "@/lib/utils";
import {
  createPreauthGrant,
  getPreauthDb,
  resolveWalletFromApiKey,
} from "@/lib/server/presence-grants-db";

export type OpenPreauthParams = {
  apiKey: string;
};

/**
 * Resolve API key and create a presence-only preauth grant.
 * Mint and max amount are not part of the grant — Collect + on-chain delegate.
 */
export async function openPresenceGrant(
  params: OpenPreauthParams,
): Promise<NextResponse> {
  const apiKey = params.apiKey.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Query param apiKey is required" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const db = getPreauthDb();
    const wallet = await resolveWalletFromApiKey(db, apiKey);
    if (!wallet) {
      return NextResponse.json(
        { error: "Invalid or revoked API key" },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    const grant = await createPreauthGrant(db, { wallet });

    return NextResponse.json(
      {
        expiresAt: grant.expiresAt,
        grantId: grant.id,
        wallet: grant.wallet,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message = getErrorMessage(error, "Internal error");
    const status = message.includes("rate limited") ? 429 : 500;
    return NextResponse.json(
      { error: toUserErrorMessage(error, message) },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
