import {
  authenticatePasskeyForTransfer,
  beginTransfer,
  completeTransfer,
  fetchAsset,
} from "phygital-token-sdk";
import type { Address } from "@solana/kit";

import { isSponsoredSubmitAvailable } from "@/lib/payments/collect-settle";
import { submitSettleClaim } from "@/lib/payments/settle-client";
import {
  simulateSponsoredInstructions,
} from "@/lib/solana/simulate-sponsored";
import { getSolanaRpc } from "@/lib/solana/rpc";

/**
 * Pre-NFC checks: sponsored config, asset still claimable,
 * recipient is not already the owner.
 */
export async function assertClaimReady(args: {
  asset: Address;
  recipient: Address;
}): Promise<void> {
  if (!isSponsoredSubmitAvailable()) {
    throw new Error("Sponsored submit is not configured");
  }

  const { data } = await fetchAsset(getSolanaRpc(), args.asset);
  if (data.isLocked) {
    throw new Error(
      "This NFC device is locked. Unlock it before moving it to this phone.",
    );
  }
  if (data.owner === args.recipient) {
    throw new Error("This NFC device is already on that wallet.");
  }
}

/**
 * NFC → build → simulate → enqueue. Simulation uses the same instruction list
 * the fee-payer DO will submit (sigVerify off).
 * Call {@link assertClaimReady} first so failures don’t look like NFC errors.
 */
export async function claimSponsoredOwnership(args: {
  asset: Address;
  recipient: Address;
  onPasskeyComplete?: () => void;
  /** Skip when the caller already ran {@link assertClaimReady}. */
  skipReadyCheck?: boolean;
}): Promise<{ signature: string }> {
  if (!args.skipReadyCheck) {
    await assertClaimReady(args);
  }

  const session = await beginTransfer({
    rpc: getSolanaRpc(),
    asset: args.asset,
  });
  const auth = await authenticatePasskeyForTransfer(session);
  args.onPasskeyComplete?.();

  const instructions = await completeTransfer(
    session,
    auth,
    args.recipient,
  );
  await simulateSponsoredInstructions(instructions);

  const { signature } = await submitSettleClaim({
    asset: session.asset,
    slotNumber: session.slotNumber,
    auth,
    recipient: args.recipient,
  });
  return { signature };
}
