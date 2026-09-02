/**
 * Map technical payment / preauth / submit errors to human-facing copy.
 * Keep raw Error.message in logs; never show engineer jargon in toasts.
 *
 * Voice: Apple Pay — short title, one calm next step. Everyday words only.
 * No window, grant, delegate, ATA, mint, or program IDs.
 */

import { errorCopy } from "@/lib/copy/phygital";

const DEFAULT_ERROR_BODY: string = errorCopy.fallback.body;
const DEFAULT_ERROR: UserFacingError = errorCopy.fallback;

export type UserFacingError = {
  title: string;
  body: string;
};

type Rule = {
  test: RegExp | string;
  facing: UserFacingError;
};

const RULES: Rule[] = [
  {
    test: /signature verification|signatures missing|7050012/i,
    facing: errorCopy.couldntVerify,
  },
  {
    test: /insufficient funds|insufficient lamports|not enough balance|don't have enough balance|custom program error: 0x1\b/i,
    facing: errorCopy.notEnoughMoney,
  },
  {
    test: /transaction would fail|simulation failed/i,
    facing: errorCopy.paymentFailed,
  },
  {
    test: /already on that wallet/i,
    facing: errorCopy.alreadyAdded,
  },
  {
    test: /accessory is locked|unlock it before moving|unlock it before claiming|TokenIsCurrentlyLocked|currently locked|unlock the phygital token/i,
    facing: errorCopy.accessoryLocked,
  },
  {
    test: /recipient token account is missing|token account is missing\. create it/i,
    facing: errorCopy.finishSetup,
  },
  {
    test: /preauth grant already used/i,
    facing: errorCopy.alreadyUsed,
  },
  {
    test: /no active preauth grant|missing preauth/i,
    facing: errorCopy.payNotReady,
  },
  {
    test: /not the SPL delegate|haven't enabled this token for Pay|enable this token for Pay/i,
    facing: errorCopy.tokenNotOn,
  },
  {
    test: /more than their spending limit|Delegated amount is insufficient/i,
    facing: errorCopy.overLimit,
  },
  {
    test: /delegated amount|delegate mismatch/i,
    facing: errorCopy.overLimit,
  },
  {
    test: /preauth rate limited/i,
    facing: errorCopy.tryAgainShortly,
  },
  {
    test: /this API key is for a different wallet/i,
    facing: errorCopy.wrongWallet,
  },
  {
    test: /key has been revoked|re-provision to get a new key/i,
    facing: errorCopy.payReset,
  },
  {
    test: /invalid or revoked API key/i,
    facing: errorCopy.didntWork,
  },
  {
    test: /missing x-api-key header|missing preauth api key|Pay isn't set up on this phone|Pay isn't set up in this browser|Pay isn't turned on here/i,
    facing: errorCopy.payNotSetUp,
  },
  {
    test: /query param grantid is required|preauth grant not found/i,
    facing: errorCopy.paymentNotFound,
  },
  {
    test: /user rejected|rejected the request|transaction cancelled|signing was cancelled|user closed|closed the flow|user_exited/i,
    facing: errorCopy.cancelled,
  },
  {
    test: /sponsored submit is not configured|fee-free|fee_payer|fee payer|PAY_HMAC_SECRET|PREAUTH_GRANTS Durable Object/i,
    facing: errorCopy.paymentsUnavailable,
  },
  {
    test: /timed out waiting for sponsored/i,
    facing: errorCopy.takingTooLong,
  },
  {
    test: /tap proof expired|slot hash no longer valid/i,
    facing: errorCopy.sessionEnded,
  },
  {
    test: /slot hashes|slot hash/i,
    facing: errorCopy.tryAgainBody,
  },
  {
    test: /owner verifier/i,
    facing: errorCopy.tryAgainBody,
  },
  {
    test: /no locked NFC accessory|lock the accessory|add it to a wallet first/i,
    facing: errorCopy.accessoryNotReady,
  },
  {
    test: /token is not lockable|TokenIsNotLockable/i,
    facing: errorCopy.cantLock,
  },
  {
    test: /owner mismatch|OwnerMismatch/i,
    facing: errorCopy.wrongOwnerWallet,
  },
  {
    test: /belongs to the receiving wallet|collect a payment from yourself/i,
    facing: errorCopy.ownAccessory,
  },
  {
    test: /this tap timed out|this tap was already used/i,
    facing: errorCopy.sessionEnded,
  },
  {
    test: /this is not the same NFC accessory/i,
    facing: errorCopy.wrongItem,
  },
  {
    test: /couldn't verify this NFC accessory|message mismatch/i,
    facing: errorCopy.nfcVerifyFailed,
  },
  {
    test: /isn't set up|not registered/i,
    facing: errorCopy.notSetUp,
  },
  {
    test: /missing tap parameters|verification failed|invalid signature/i,
    facing: errorCopy.nfcVerifyFailed,
  },
  {
    test: /connect your wallet|connect a wallet|sign in to continue/i,
    facing: errorCopy.connectToContinue,
  },
  {
    test: /NFC accessory not found|accessory not found|missing passkey/i,
    facing: errorCopy.itemNotFound,
  },
  {
    test: /only classic spl|token-2022/i,
    facing: errorCopy.tokenNotSupported,
  },
  {
    test: /mint account not found/i,
    facing: errorCopy.tokenUnavailable,
  },
  {
    test: /enter a valid amount/i,
    facing: errorCopy.enterAmount,
  },
  {
    test: /amount supports at most/i,
    facing: errorCopy.amountTooPrecise,
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
    return rule.facing;
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
  fallback: UserFacingError | string = DEFAULT_ERROR_BODY,
): UserFacingError {
  const fb =
    typeof fallback === "string"
      ? { title: DEFAULT_ERROR.title, body: fallback }
      : fallback;
  return toFacing(error, fb);
}

/** Compact line for toasts and inline banners. */
export function toUserErrorMessage(
  error: unknown,
  fallback: string = DEFAULT_ERROR_BODY,
): string {
  const raw = rawMessage(error).trim();
  if (!raw) return fallback;

  const rule = matchRule(raw);
  if (rule) {
    return rule.facing.title;
  }

  if (isAlreadyFriendly(raw)) return raw;

  if (raw !== fallback) logPaymentError("sanitized", error);
  return fallback;
}

/** Single Shortcuts / notification line: title folded into body. */
export function toUserFacingBody(
  error: unknown,
  fallback: UserFacingError | string = DEFAULT_ERROR_BODY,
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
