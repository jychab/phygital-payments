import { startAuthentication, verifyResponse } from "phygital-token-sdk";

import { getSolanaRpc } from "@/lib/solana/rpc";
import { bindVerifiedPasskey } from "@/lib/token/bind-passkey";

/**
 * Live NFC check in the browser: local challenge → `startAuthentication` →
 * `verifyResponse`. Pass `expectedPublicKey` after a signed URL so the live
 * tap must be this chip.
 */
export async function authenticateToken(args?: {
  expectedPublicKey?: string;
  onPasskeyComplete?: () => void;
}): Promise<{
  secp256r1PublicKey: string;
  message: string;
  response: Awaited<ReturnType<typeof startAuthentication>>;
}> {
  const message = crypto.randomUUID();
  const response = await startAuthentication(message, getSolanaRpc());

  const secp256r1PublicKey = bindVerifiedPasskey(
    verifyResponse({ expectedMessage: message, response }),
    args?.expectedPublicKey,
  );

  // Only signal success after crypto verify — not right after the OS prompt.
  args?.onPasskeyComplete?.();

  return { secp256r1PublicKey, message, response };
}
