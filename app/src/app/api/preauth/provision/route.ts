import { NextRequest, NextResponse } from "next/server";
import { address, getAddressEncoder } from "@solana/kit";
import { ed25519 } from "@noble/curves/ed25519.js";

import { base64ToBytes } from "@/lib/crypto/base64";
import { getPreauthDb, issueWalletApiKey } from "@/lib/server/presence-grants-db";

const MESSAGE_PREFIX = "phygital-pay:provision:";
const MAX_AGE_MS = 5 * 60 * 1000;

/**
 * POST /api/preauth/provision
 * Body: { wallet, message, signature } — signature is base64 ed25519 over `message`.
 * Issues (or rotates) a device pay key for the signing wallet. Raw key returned once.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      wallet?: string;
      message?: string;
      signature?: string;
    };
    const wallet = body.wallet?.trim();
    const message = body.message?.trim();
    const signatureB64 = body.signature?.trim();

    if (!wallet || !message || !signatureB64) {
      return NextResponse.json(
        { error: "wallet, message, and signature are required" },
        { status: 400 },
      );
    }

    if (!message.startsWith(`${MESSAGE_PREFIX}${wallet}:`)) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const tsRaw = message.slice(`${MESSAGE_PREFIX}${wallet}:`.length);
    const ts = Number(tsRaw);
    if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > MAX_AGE_MS) {
      return NextResponse.json({ error: "Message expired" }, { status: 400 });
    }

    let pubkey: Uint8Array;
    try {
      pubkey = new Uint8Array(getAddressEncoder().encode(address(wallet)));
    } catch {
      return NextResponse.json({ error: "Invalid wallet" }, { status: 400 });
    }
    if (pubkey.length !== 32) {
      return NextResponse.json({ error: "Invalid wallet" }, { status: 400 });
    }

    let signature: Uint8Array;
    try {
      signature = base64ToBytes(signatureB64);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    if (signature.length !== 64) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const ok = ed25519.verify(
      signature,
      new TextEncoder().encode(message),
      pubkey,
    );
    if (!ok) {
      return NextResponse.json({ error: "Bad signature" }, { status: 401 });
    }

    const { apiKey } = await issueWalletApiKey(getPreauthDb(), wallet);
    return NextResponse.json({ wallet, apiKey });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
