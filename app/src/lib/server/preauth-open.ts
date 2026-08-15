import "server-only";

import { NextResponse } from "next/server";

import { USDC_DECIMALS } from "@/lib/payments/usdc";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { getErrorMessage } from "@/lib/utils";
import {
  createPreauthGrant,
  getPreauthDb,
  resolveWalletFromApiKey,
} from "@/lib/server/preauth-db";

/** Convert a human USDC amount string to raw u64 decimal (no float). */
export function parseAmountUiToRaw(
  amountUi: string,
  decimals: number = USDC_DECIMALS,
): string {
  const trimmed = amountUi.trim();
  if (!trimmed || Number(trimmed) <= 0) {
    throw new Error("Enter a valid amount");
  }
  const [whole = "0", frac = ""] = trimmed.split(".");
  if (!/^\d+$/.test(whole) || (frac.length > 0 && !/^\d+$/.test(frac))) {
    throw new Error("Enter a valid amount");
  }
  if (frac.length > decimals) {
    throw new Error(`Amount supports at most ${decimals} decimals`);
  }
  const padded = frac.padEnd(decimals, "0");
  const raw = BigInt(`${whole}${padded}`).toString();
  if (raw === "0") throw new Error("Enter a valid amount");
  return raw;
}

export type OpenPreauthParams = {
  apiKey: string;
  amount?: string | null;
  amountUi?: string | null;
  mint?: string | null;
};

/**
 * Resolve API key + amount query/body fields and create a preauth grant.
 * Returns a NextResponse (JSON) suitable for the open route.
 */
export async function openPreauthGrant(
  params: OpenPreauthParams,
): Promise<NextResponse> {
  const apiKey = params.apiKey.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Query param apiKey is required" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const amountRaw = params.amount?.trim() || "";
  const amountUi = params.amountUi?.trim() || "";
  const hasAmount = Boolean(amountRaw);
  const hasAmountUi = Boolean(amountUi);

  if (hasAmount === hasAmountUi) {
    return NextResponse.json(
      {
        error: "Provide exactly one of amount (raw u64) or amountUi",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  let maxAmount: string;
  try {
    if (hasAmount) {
      if (!/^\d+$/.test(amountRaw) || amountRaw === "0") {
        throw new Error("amount must be a positive raw u64 decimal string");
      }
      maxAmount = amountRaw;
    } else {
      maxAmount = parseAmountUiToRaw(amountUi);
    }
  } catch (error) {
    return NextResponse.json(
      { error: toUserErrorMessage(error, "Invalid amount") },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const mint =
    typeof params.mint === "string" && params.mint.trim()
      ? params.mint.trim()
      : null;

  try {
    const db = getPreauthDb();
    const wallet = await resolveWalletFromApiKey(db, apiKey);
    if (!wallet) {
      return NextResponse.json(
        { error: "Invalid or revoked API key" },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    const grant = await createPreauthGrant(db, {
      wallet,
      maxAmount,
      mint,
    });

    return NextResponse.json(
      {
        expiresAt: grant.expiresAt,
        grantId: grant.id,
        wallet: grant.wallet,
        maxAmount: grant.maxAmount,
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
