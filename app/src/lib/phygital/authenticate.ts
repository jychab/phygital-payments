import { startAuthentication, verifyResponse } from "phygital-token-sdk";

import { bindVerifiedPasskey } from "@/lib/phygital/bind-passkey";
import { hapticTap } from "@/lib/phygital/haptic";

/**
 * Live NFC check in the browser: local challenge → `startAuthentication` →
 * `verifyResponse`. Pass `expectedPublicKey` after a signed URL so the live
 * tap must be this chip.
 */
export async function authenticatePhygital(args?: {
  expectedPublicKey?: string;
}): Promise<{ secp256r1PublicKey: string }> {
  const message = crypto.randomUUID();
  const response = await startAuthentication(message);
  hapticTap();

  const secp256r1PublicKey = bindVerifiedPasskey(
    verifyResponse({ expectedMessage: message, response }),
    args?.expectedPublicKey,
  );

  return { secp256r1PublicKey };
}
