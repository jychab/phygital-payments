/**
 * Map technical payment / preauth / submit errors to human-facing copy.
 * Keep raw Error.message in logs; never show engineer jargon in toasts.
 *
 * Voice: Apple Pay — short title, one calm next step. Everyday words only.
 * No window, grant, delegate, ATA, mint, or program IDs.
 */

export type UserFacingError = {
  title: string;
  body: string;
};

type Rule = {
  test: RegExp | string;
  title: string;
  body: string;
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
    body: "This accessory is already on that wallet.",
  },
  {
    test: /accessory is locked|unlock it before moving|unlock it before claiming/i,
    title: "Accessory Locked",
    body: "Unlock this accessory, then try again.",
  },
  {
    test: /recipient token account is missing|token account is missing\. create it/i,
    title: "Finish Setup",
    body: "This wallet isn’t ready to receive yet. Finish setup, then try again.",
  },
  {
    test: /preauth grant already used/i,
    title: "Already Used",
    body: "Ask them to press Pay again, then hold their accessory here.",
  },
  {
    test: /no active preauth grant|missing preauth/i,
    title: "Pay Isn’t Ready",
    body: "Ask them to press Pay on their phone, then hold their accessory here.",
  },
  {
    test: /not the SPL delegate|haven't enabled this token for Pay|enable this token for Pay/i,
    title: "This Token Isn’t On",
    body: "Ask them to set a spending limit for this token, then try again.",
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
    test: /this API key is for a different wallet/i,
    title: "Wrong Wallet",
    body: "That belongs to a different wallet.",
  },
  {
    test: /key has been revoked|re-provision to get a new key/i,
    title: "Pay Was Reset",
    body: "Turn on Pay again.",
  },
  {
    test: /invalid or revoked API key/i,
    title: "That Didn’t Work",
    body: "Check what you pasted and try again.",
  },
  {
    test: /missing x-api-key header|missing preauth api key|Pay isn't set up on this phone|Pay isn't set up in this browser|Pay isn't turned on here/i,
    title: "Revibase Pay Isn’t Set Up",
    body: "Generate or import an API key in this browser first.",
  },
  {
    test: /query param grantid is required|preauth grant not found/i,
    title: "Payment Not Found",
    body: "Press Pay again to continue.",
  },
  {
    test: /user rejected|rejected the request|transaction cancelled|signing was cancelled|user closed|closed the flow|user_exited/i,
    title: "Cancelled",
    body: "Nothing was charged.",
  },
  {
    test: /sponsored submit is not configured|fee-free|fee_payer|fee payer|PAY_HMAC_SECRET|PREAUTH_GRANTS Durable Object/i,
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
    title: "Session ended",
    body: "Hold your item here again, then tap the ring to verify.",
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
    test: /no locked NFC accessory|lock the accessory/i,
    title: "Accessory Isn’t Ready",
    body: "Ask them to lock this accessory, then try again.",
  },
  {
    test: /token is not lockable|TokenIsNotLockable/i,
    title: "Can’t Lock",
    body: "This accessory can’t be locked.",
  },
  {
    test: /owner mismatch|OwnerMismatch/i,
    title: "Wrong Wallet",
    body: "Connect the wallet that owns this accessory.",
  },
  {
    test: /belongs to the receiving wallet|collect a payment from yourself/i,
    title: "That’s Your Accessory",
    body: "You can’t collect a payment from your own accessory.",
  },
  {
    test: /this tap timed out|this tap was already used/i,
    title: "Session ended",
    body: "Hold your item here again, then tap the ring to verify.",
  },
  {
    test: /this is not the same NFC accessory/i,
    title: "Wrong item",
    body: "Hold the same item against the back of your phone.",
  },
  {
    test: /couldn't verify this NFC accessory|message mismatch/i,
    title: "Couldn't verify",
    body: "Hold your item flat against the back of your phone and tap the ring to try again.",
  },
  {
    test: /isn't set up|not registered/i,
    title: "Not set up",
    body: "This item isn't registered on Revibase yet.",
  },
  {
    test: /missing tap parameters|verification failed|invalid signature/i,
    title: "Couldn't verify",
    body: "Hold your item flat against the back of your phone and tap the ring to try again.",
  },
  {
    test: /connect your wallet|connect a wallet|sign in to continue/i,
    title: "Connect your wallet",
    body: "Connect your wallet to continue.",
  },
  {
    test: /NFC accessory not found|accessory not found|missing passkey/i,
    title: "Item not found",
    body: "Hold your item here again, then tap the ring to verify.",
  },
  {
    test: /only classic spl|token-2022/i,
    title: "Token Not Supported",
    body: "This token isn’t supported. Switch to USDC.",
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
    title: "Amount Too Precise",
    body: "Use fewer decimal places.",
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
    return rule.title;
  }

  if (isAlreadyFriendly(raw)) return raw;

  if (raw !== fallback) logPaymentError("sanitized", error);
  return fallback;
}

/** Single Shortcuts / notification line: title folded into body. */
export function toUserFacingBody(
  error: unknown,
  fallback: UserFacingError | string = FALLBACK_BODY,
): string {
  const facing = toUserFacingError(error, fallback);
  if (
    facing.body === facing.title ||
    facing.body.startsWith(`${facing.title}.`) ||
    facing.body.startsWith(`${facing.title} `)
  ) {
    return facing.body;
  }
  return `${facing.title}. ${facing.body}`;
}
