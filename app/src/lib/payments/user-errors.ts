/**
 * Map technical payment / preauth / submit errors to human-facing copy.
 * Keep raw Error.message in logs; never show engineer jargon in toasts.
 */

type Rule = { test: RegExp | string; message: string };

const RULES: Rule[] = [
  {
    test: /signature verification|signatures missing|7050012/i,
    message:
      "Wallet signature didn’t verify. Disconnect, reconnect, and try again.",
  },
  {
    test: /transaction would fail|simulation failed/i,
    message: "That payment wouldn’t go through. Check the amount and try again.",
  },
  {
    test: /already on that wallet/i,
    message: "This NFC device is already on that wallet.",
  },
  {
    test: /device is locked|unlock it before moving/i,
    message: "This NFC device is locked. Unlock it, then try again.",
  },
  {
    test: /recipient token account is missing|token account is missing\. create it/i,
    message: "Set up a receive account before collecting.",
  },
  {
    test: /no active preauth grant|preauth grant already used|missing preauth/i,
    message: "Ask them to tap Ready to pay again, then hold their NFC device here.",
  },
  {
    test: /preauth grant mint mismatch/i,
    message:
      "They opened a window for a different token. Ask them to Ready to pay again.",
  },
  {
    test: /exceeds preauth maxAmount/i,
    message:
      "That amount is more than they authorized. Ask them to raise the max and Ready to pay again.",
  },
  {
    test: /not the SPL delegate|enable this token for Pay|Delegated amount is insufficient/i,
    message:
      "They need to enable this token for Pay (or raise the limit), then try again.",
  },
  {
    test: /delegated amount|delegate mismatch|insufficient funds|insufficient lamports|custom program error: 0x1\b/i,
    message:
      "They need to enable this token for Pay (or raise the limit), then try again.",
  },
  {
    test: /preauth rate limited/i,
    message: "Too many attempts — wait a moment and try again.",
  },
  {
    test: /missing preauth api key|enable Pay on this device/i,
    message: "Turn on Pay on this phone first.",
  },
  {
    test: /user rejected|rejected the request|transaction cancelled|signing was cancelled/i,
    message: "Transaction cancelled.",
  },
  {
    test: /sponsored submit is not configured|fee-free|fee_payer|fee payer/i,
    message: "Payments aren’t available right now.",
  },
  {
    test: /timed out waiting for sponsored/i,
    message: "That’s taking too long. Try again.",
  },
  {
    test: /tap proof expired|slot hash no longer valid/i,
    message: "Tap proof expired. Tap your NFC device again in Safari.",
  },
  {
    test: /slot hashes|slot hash/i,
    message: "Payment didn’t go through. Try again.",
  },
  {
    test: /owner verifier/i,
    message: "Payment didn’t go through. Try again.",
  },
  {
    test: /no locked (pass|device|NFC device)|lock the asset/i,
    message:
      "This NFC device isn’t locked for payments. Lock it, then try again.",
  },
  {
    test: /asset is not lockable|AssetIsNotLockable/i,
    message: "This NFC device can’t be locked.",
  },
  {
    test: /owner mismatch|OwnerMismatch/i,
    message: "Connect the wallet that owns this NFC device.",
  },
  {
    test: /belongs to the receiving wallet|collect a payment from yourself/i,
    message: "You can’t collect a payment from your own NFC device.",
  },
  {
    test: /USDC account is missing|needs a USDC account|create it before receiving|receive account/i,
    message: "Set up a receive account before collecting.",
  },
  {
    test: /this tap was already used/i,
    message: "This tap was already used. Tap your NFC device again to continue.",
  },
  {
    test: /missing tap parameters|verification failed|invalid signature/i,
    message: "Hold flat against the back of your phone and try again.",
  },
  {
    test: /connect your wallet|connect a wallet|sign in to continue/i,
    message: "Connect your wallet to continue.",
  },
  {
    test: /(pass|device|NFC device) not found|missing passkey/i,
    message: "We couldn’t find this NFC device. Try tapping again.",
  },
  {
    test: /only classic spl|token-2022|only usdc is supported/i,
    message: "Only verified classic SPL tokens are supported.",
  },
  {
    test: /mint account not found/i,
    message: "That token isn’t available. Switch to USDC.",
  },
  {
    test: /enter a valid amount/i,
    message: "Enter a valid amount.",
  },
  {
    test: /amount supports at most/i,
    message: "That amount has too many decimal places.",
  },
];

function rawMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "";
}

/** Human-readable message for UI (toasts, banners). */
export function toUserErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Try again.",
): string {
  const raw = rawMessage(error).trim();
  if (!raw) return fallback;

  for (const rule of RULES) {
    if (typeof rule.test === "string") {
      if (raw.toLowerCase().includes(rule.test.toLowerCase())) {
        return rule.message;
      }
    } else if (rule.test.test(raw)) {
      return rule.message;
    }
  }

  // Already-friendly product copy (no snake_case / API jargon).
  if (
    !/[_\-]{2,}|\b(sysvar|u64|PDA|ATA|RPC|D1|KV)\b/i.test(raw) &&
    raw.length < 140 &&
    !/^[A-Z][a-z]+[A-Z]/.test(raw) // camelCase identifiers
  ) {
    return raw;
  }

  return fallback;
}
