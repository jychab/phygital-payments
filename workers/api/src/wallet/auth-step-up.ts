import {
  assertWalletAuthAssertion,
  WalletAuthError,
  type ResolvedWalletSession,
  type WalletAuthAssertionWire,
} from "./auth";
import { takeWalletAuthChallenge } from "./auth-store";
import { requireWalletSession } from "./session";

/** Fresh Face ID proof for sensitive wallet-owner mutations. */
export async function requireWalletAuthStepUp(
  req: Request,
  wire: WalletAuthAssertionWire | undefined,
): Promise<ResolvedWalletSession> {
  const session = await requireWalletSession();
  if (!wire?.requestId) {
    throw new WalletAuthError("Confirm with Face ID first.");
  }
  const stored = await takeWalletAuthChallenge(wire.requestId);
  if (!stored) {
    throw new WalletAuthError("This expired. Try again.");
  }
  const wallet = await assertWalletAuthAssertion(
    wire,
    stored.challenge,
    req.headers.get("origin"),
  );
  if (String(wallet.vaultPda) !== String(session.vaultPda)) {
    throw new WalletAuthError("Sign in again");
  }
  return wallet;
}
