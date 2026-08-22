/**
 * Map technical errors to human-facing copy.
 * Keep raw Error.message in logs; never show engineer jargon in toasts.
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

const FALLBACK_TITLE = "Couldn’t Finish";
const FALLBACK_BODY = "Something went wrong. Try again.";

const RULES: Rule[] = [
  {
    test: /signature verification|signatures missing|7050012/i,
    title: "Couldn’t Verify",
    body: "Disconnect, reconnect, and try again.",
  },
  {
    test: /already on that wallet/i,
    title: "Already Added",
    body: "This accessory is already on that wallet.",
  },
  {
    test: /accessory is locked|unlock it before moving|unlock it before claiming/i,
    title: "Accessory Locked",
    body: "This accessory is locked and can’t be claimed from this app.",
  },
  {
    test: /user rejected|rejected the request|transaction cancelled|signing was cancelled|user closed|closed the flow|user_exited/i,
    title: "Cancelled",
    body: "Nothing changed.",
  },
  {
    test: /sponsored submit is not configured|fee-free|fee_payer|fee payer/i,
    title: "Unavailable",
    body: "This isn’t available right now. Try again later.",
  },
  {
    test: /timed out waiting for sponsored/i,
    title: "Taking Too Long",
    body: "Try again.",
  },
  {
    test: /tap proof expired|slot hash no longer valid/i,
    title: "This Expired",
    body: "Hold your accessory to this phone again.",
  },
  {
    test: /slot hashes|slot hash/i,
    title: "Couldn’t Finish",
    body: "Try again.",
  },
  {
    test: /owner mismatch|OwnerMismatch/i,
    title: "Wrong Wallet",
    body: "Connect the wallet that owns this accessory.",
  },
  {
    test: /this tap was already used/i,
    title: "Already Used",
    body: "Hold your accessory to this phone again.",
  },
  {
    test: /this is not the same NFC accessory/i,
    title: "Couldn’t Verify",
    body: "Hold the same accessory against the back of your phone.",
  },
  {
    test: /couldn't verify this NFC accessory|message mismatch/i,
    title: "Couldn’t Verify",
    body: "Hold it flat against the back of your phone and try again.",
  },
  {
    test: /isn't set up|not registered/i,
    title: "Not Set Up",
    body: "This accessory isn’t set up yet.",
  },
  {
    test: /missing tap parameters|verification failed|invalid signature/i,
    title: "Couldn’t Verify",
    body: "Hold it flat against the back of your phone and try again.",
  },
  {
    test: /connect your wallet|connect a wallet|sign in to continue|create a passkey first/i,
    title: "Create a passkey",
    body: "Create a passkey to continue.",
  },
  {
    test: /NFC accessory not found|accessory not found|missing passkey/i,
    title: "Accessory Not Found",
    body: "Hold your accessory to this phone again.",
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

/** Write full error detail to the console (raw message is stripped in UI). */
export function logPaymentError(scope: string, error: unknown): void {
  const raw = getRawPaymentError(error);
  if (raw) {
    console.error(`[error:${scope}]`, raw, error);
    return;
  }
  if (error != null) {
    console.error(`[error:${scope}]`, error);
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
