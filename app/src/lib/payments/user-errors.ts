/**
 * Map technical payment / preauth / submit errors to human-facing copy.
 * Keep raw Error.message in logs; never show engineer jargon in toasts.
 *
 * Voice: Apple Wallet — short title, one calm next step. No “window”,
 * grant, delegate, ATA, or program IDs.
 */

export type UserFacingError = {
  title: string;
  body: string;
};

type Rule = {
  test: RegExp | string;
  title: string;
  body: string;
  /** Toast / compact banner. Defaults to `title`. */
  toast?: string;
};

const FALLBACK_TITLE = "Payment Not Completed";
const FALLBACK_BODY = "Something went wrong. Try again.";

const RULES: Rule[] = [
  {
    test: /signature verification|signatures missing|7050012/i,
    title: "Couldn’t Verify",
    body: "Disconnect, reconnect, and try again.",
  },
  {
    test: /insufficient funds|insufficient lamports|not enough balance|don't have enough balance|custom program error: 0x1\b/i,
    title: "Not Enough Money",
    body: "There isn’t enough in this wallet for this amount.",
  },
  {
    test: /transaction would fail|simulation failed/i,
    title: "Payment Not Completed",
    body: "This payment couldn’t go through. Check the amount and try again.",
  },
  {
    test: /already on that wallet/i,
    title: "Already Added",
    body: "This NFC device is already on that wallet.",
  },
  {
    test: /device is locked|unlock it before moving/i,
    title: "Device Locked",
    body: "Unlock this NFC device, then try again.",
  },
  {
    test: /recipient token account is missing|token account is missing\. create it/i,
    title: "Receive Account Needed",
    body: "Set up a receive account before collecting.",
  },
  {
    test: /preauth grant already used/i,
    title: "Already Used",
    body: "Ask them to enable Pay again, then hold their device here.",
  },
  {
    test: /no active preauth grant|missing preauth/i,
    title: "Payment Not Enabled",
    body: "Ask them to enable Pay on their phone, then hold their device here.",
  },
  {
    test: /preauth grant mint mismatch/i,
    title: "Wrong Token",
    body: "They enabled Pay for a different token. Ask them to enable this one.",
  },
  {
    test: /exceeds preauth maxAmount/i,
    title: "Over the Amount",
    body: "This is more than they authorized. Ask them to pay a larger amount, or collect less.",
  },
  {
    test: /not the SPL delegate|haven't enabled this token for Pay|enable this token for Pay/i,
    title: "Pay Isn’t Turned On",
    body: "Ask them to turn on this token for Pay, then try again.",
  },
  {
    test: /more than their spending limit|Delegated amount is insufficient/i,
    title: "Over the Limit",
    body: "This is more than their spending limit. Ask them to raise it, or collect less.",
  },
  {
    test: /delegated amount|delegate mismatch/i,
    title: "Over the Limit",
    body: "This is more than their spending limit. Ask them to raise it, or collect less.",
  },
  {
    test: /preauth rate limited/i,
    title: "Try Again Shortly",
    body: "Too many attempts. Wait a moment and try again.",
  },
  {
    test: /key has been revoked|re-provision to get a new key/i,
    title: "Pay Key Changed",
    body: "Turn on Pay again on this phone.",
  },
  {
    test: /missing preauth api key|enable Pay on this device|Pay isn't set up on this phone/i,
    title: "Pay Isn’t Set Up",
    body: "Turn on Pay on this phone first.",
  },
  {
    test: /user rejected|rejected the request|transaction cancelled|signing was cancelled/i,
    title: "Cancelled",
    body: "Nothing was charged.",
  },
  {
    test: /sponsored submit is not configured|fee-free|fee_payer|fee payer/i,
    title: "Payments Unavailable",
    body: "Payments aren’t available right now. Try again later.",
  },
  {
    test: /timed out waiting for sponsored/i,
    title: "Taking Too Long",
    body: "Try again.",
  },
  {
    test: /tap proof expired|slot hash no longer valid/i,
    title: "Tap Expired",
    body: "Hold your NFC device to this phone again.",
  },
  {
    test: /slot hashes|slot hash/i,
    title: "Payment Not Completed",
    body: "Try again.",
  },
  {
    test: /owner verifier/i,
    title: "Payment Not Completed",
    body: "Try again.",
  },
  {
    test: /no locked (pass|device|NFC device)|lock the asset/i,
    title: "Device Isn’t Ready",
    body: "Ask them to lock this NFC device, then try again.",
  },
  {
    test: /asset is not lockable|AssetIsNotLockable/i,
    title: "Can’t Lock",
    body: "This NFC device can’t be locked.",
  },
  {
    test: /owner mismatch|OwnerMismatch/i,
    title: "Wrong Wallet",
    body: "Connect the wallet that owns this NFC device.",
  },
  {
    test: /belongs to the receiving wallet|collect a payment from yourself/i,
    title: "That’s Your Device",
    body: "You can’t collect a payment from your own NFC device.",
  },
  {
    test: /USDC account is missing|needs a USDC account|create it before receiving|receive account/i,
    title: "Receive Account Needed",
    body: "Set up a receive account before collecting.",
  },
  {
    test: /this tap was already used/i,
    title: "Already Used",
    body: "Hold your NFC device to this phone again.",
  },
  {
    test: /missing tap parameters|verification failed|invalid signature/i,
    title: "Couldn’t Read",
    body: "Hold flat against the back of your phone and try again.",
  },
  {
    test: /connect your wallet|connect a wallet|sign in to continue/i,
    title: "Connect Wallet",
    body: "Connect your wallet to continue.",
  },
  {
    test: /(pass|device|NFC device) not found|missing passkey/i,
    title: "Device Not Found",
    body: "Hold your NFC device to this phone again.",
  },
  {
    test: /only classic spl|token-2022|only usdc is supported/i,
    title: "Token Not Supported",
    body: "Only verified tokens can be used. Switch to USDC.",
  },
  {
    test: /mint account not found/i,
    title: "Token Unavailable",
    body: "Switch to USDC and try again.",
  },
  {
    test: /enter a valid amount/i,
    title: "Enter an Amount",
    body: "Enter a valid amount.",
  },
  {
    test: /amount supports at most/i,
    title: "Too Many Decimals",
    body: "That amount has too many decimal places.",
  },
];

function rawMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "";
}

function matchRule(raw: string): Rule | null {
  for (const rule of RULES) {
    if (typeof rule.test === "string") {
      if (raw.toLowerCase().includes(rule.test.toLowerCase())) return rule;
    } else if (rule.test.test(raw)) {
      return rule;
    }
  }
  return null;
}

function isAlreadyFriendly(raw: string): boolean {
  return (
    !/[_\-]{2,}|\b(sysvar|u64|PDA|ATA|RPC|D1|KV)\b/i.test(raw) &&
    raw.length < 140 &&
    !/^[A-Z][a-z]+[A-Z]/.test(raw)
  );
}

/** Technical error text before user-facing sanitization (for logs / dev UI). */
export function getRawPaymentError(error: unknown): string {
  return rawMessage(error).trim();
}

/** Write full payment error detail to the console (raw message is stripped in UI). */
export function logPaymentError(scope: string, error: unknown): void {
  const raw = getRawPaymentError(error);
  if (raw) {
    console.error(`[payment:${scope}]`, raw, error);
    return;
  }
  if (error != null) {
    console.error(`[payment:${scope}]`, error);
  }
}

function toFacing(
  error: unknown,
  fallback: UserFacingError,
): UserFacingError {
  const raw = rawMessage(error).trim();
  if (!raw) return fallback;

  const rule = matchRule(raw);
  if (rule) {
    return { title: rule.title, body: rule.body };
  }

  if (isAlreadyFriendly(raw)) {
    return { title: fallback.title, body: raw };
  }

  if (raw !== fallback.body) logPaymentError("sanitized", error);
  return fallback;
}

/** Title + body for full-screen payment outcomes. */
export function toUserFacingError(
  error: unknown,
  fallback: UserFacingError | string = FALLBACK_BODY,
): UserFacingError {
  const fb =
    typeof fallback === "string"
      ? { title: FALLBACK_TITLE, body: fallback }
      : fallback;
  return toFacing(error, fb);
}

/** Compact line for toasts and inline banners. */
export function toUserErrorMessage(
  error: unknown,
  fallback = FALLBACK_BODY,
): string {
  const raw = rawMessage(error).trim();
  if (!raw) return fallback;

  const rule = matchRule(raw);
  if (rule) {
    return rule.toast ?? rule.title;
  }

  if (isAlreadyFriendly(raw)) return raw;

  if (raw !== fallback) logPaymentError("sanitized", error);
  return fallback;
}
