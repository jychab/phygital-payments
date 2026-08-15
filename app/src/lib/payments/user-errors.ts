/**
 * Map technical payment / preauth / submit errors to human-facing copy.
 * Keep raw Error.message in logs; never show engineer jargon in toasts.
 */

type Rule = { test: RegExp | string; message: string };

const RULES: Rule[] = [
  {
    test: /no active preauth grant|preauth grant already used|missing preauth/i,
    message: "Ask them to tap Ready to pay again, then hold their NFC device here.",
  },
  {
    test: /exceeds preauth maxAmount|amount exceeds/i,
    message: "Amount is higher than they authorized. Ask them to raise it and try again.",
  },
  {
    test: /preauth grant mint mismatch/i,
    message: "Payment didn’t go through. Try again.",
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
    test: /sponsored submit is not configured|fee-free|fee_payer|fee payer/i,
    message: "Payments aren’t available right now.",
  },
  {
    test: /timed out waiting for sponsored/i,
    message: "That’s taking too long. Try again.",
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
    test: /belongs to the receiving wallet|collect a payment from yourself/i,
    message: "You can’t collect a payment from your own NFC device.",
  },
  {
    test: /USDC account is missing|needs a USDC account|create it before receiving/i,
    message: "Set up a USDC account before receiving.",
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
    test: /connect your wallet|connect a wallet/i,
    message: "Sign in to continue.",
  },
  {
    test: /(pass|device|NFC device) not found|missing passkey/i,
    message: "We couldn’t find this NFC device. Try tapping again.",
  },
  {
    test: /only usdc is supported/i,
    message: "Only USDC is supported.",
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
