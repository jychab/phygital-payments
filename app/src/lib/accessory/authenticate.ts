import { startAuthentication, verifyResponse } from "phygital-token-sdk";

import { bindVerifiedPasskey } from "@/lib/accessory/bind-passkey";

/**
 * Live NFC check in the browser: local challenge → `startAuthentication` →
 * `verifyResponse`. Pass `expectedPublicKey` after a signed URL so the live
 * tap must be this chip.
 */
export async function authenticateAccessory(args?: {
  expectedPublicKey?: string;
  onPasskeyComplete?: () => void;
}): Promise<{ secp256r1PublicKey: string }> {
  const message = crypto.randomUUID();
  const response = await startAuthentication(message);
  args?.onPasskeyComplete?.();

  const secp256r1PublicKey = bindVerifiedPasskey(
    verifyResponse({ expectedMessage: message, response }),
    args?.expectedPublicKey,
  );

  return { secp256r1PublicKey };
}
