import type { Signature } from "@solana/kit";

import { getSolanaRpc, getSolanaRpcSubscriptions } from "@/lib/solana/rpc";

const CONFIRM_TIMEOUT_MS = 25_000;
const POLL_INTERVAL_MS = 1_500;

function timeoutError(): Error {
  return new Error("timed out waiting for sponsored transaction");
}

function onChainError(err: unknown): Error {
  const detail =
    typeof err === "string"
      ? err
      : JSON.stringify(err, (_, v) => (typeof v === "bigint" ? v.toString() : v));
  return new Error(`Transaction failed on-chain: ${detail}`);
}

function isConfirmed(
  status: "processed" | "confirmed" | "finalized" | null | undefined,
): boolean {
  return status === "confirmed" || status === "finalized";
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(timeoutError());
      return;
    }
    const id = setTimeout(() => resolve(), ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(timeoutError());
      },
      { once: true },
    );
  });
}

async function readSignatureOutcome(
  signature: Signature,
  signal: AbortSignal,
): Promise<"pending" | "confirmed"> {
  const { value } = await getSolanaRpc()
    .getSignatureStatuses([signature])
    .send({ abortSignal: signal });
  const status = value[0];
  if (status?.err) throw onChainError(status.err);
  if (isConfirmed(status?.confirmationStatus)) return "confirmed";
  return "pending";
}

async function waitViaSignatureSubscribe(
  signature: Signature,
  signal: AbortSignal,
): Promise<void> {
  const notifications = await getSolanaRpcSubscriptions()
    .signatureNotifications(signature, { commitment: "confirmed" })
    .subscribe({ abortSignal: signal });

  for await (const notification of notifications) {
    if (notification.value.err) throw onChainError(notification.value.err);
    return;
  }
  throw timeoutError();
}

async function waitViaStatusPoll(
  signature: Signature,
  lastValidBlockHeight: bigint,
  signal: AbortSignal,
): Promise<void> {
  const rpc = getSolanaRpc();
  while (!signal.aborted) {
    if ((await readSignatureOutcome(signature, signal)) === "confirmed") {
      return;
    }
    const height = await rpc
      .getBlockHeight({ commitment: "confirmed" })
      .send({ abortSignal: signal });
    if (height > lastValidBlockHeight) throw timeoutError();
    await sleep(POLL_INTERVAL_MS, signal);
  }
  throw timeoutError();
}

/**
 * Wait until a submitted signature reaches `confirmed` (or `finalized`).
 * Prefers `signatureSubscribe`; falls back to `getSignatureStatuses` polling.
 * Rejects on on-chain err, blockhash expiry, or a ~25s wall-clock cap.
 */
export async function waitForSignatureConfirmed(
  signature: string,
  lastValidBlockHeight: number,
): Promise<void> {
  const sig = signature as Signature;
  const lastHeight = BigInt(lastValidBlockHeight);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIRM_TIMEOUT_MS);
  const { signal } = controller;

  try {
    if ((await readSignatureOutcome(sig, signal)) === "confirmed") return;

    const poll = waitViaStatusPoll(sig, lastHeight, signal);

    // WS setup failure / drop → hang this branch so the poll path can win.
    const subscribe = waitViaSignatureSubscribe(sig, signal).catch(
      (error: unknown) => {
        if (
          error instanceof Error &&
          error.message.startsWith("Transaction failed on-chain")
        ) {
          throw error;
        }
        return new Promise<void>(() => {});
      },
    );

    await Promise.race([subscribe, poll]);
  } catch (error) {
    if (
      signal.aborted &&
      !(
        error instanceof Error &&
        error.message.startsWith("Transaction failed on-chain")
      )
    ) {
      throw timeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
