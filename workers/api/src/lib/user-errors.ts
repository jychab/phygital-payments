/**
 * Map technical errors to human-facing copy.
 * Keep raw Error.message in logs; never show engineer jargon in toasts.
 */

type Rule = {
  test: RegExp;
  title: string;
};

const FALLBACK_BODY = "Something went wrong. Try again.";

const RULES: Rule[] = [
  {
    test: /signature verification|signatures missing|7050012/i,
    title: "Couldn’t Verify",
  },
  {
    test: /already on that wallet/i,
    title: "Already Added",
  },
  {
    test: /phygital token is locked|accessory is locked|unlock it before moving|unlock it before claiming|unlock it before adding/i,
    title: "Accessory Locked",
  },
  {
    test: /user rejected|rejected the request|transaction cancelled|signing was cancelled|user closed|closed the flow|user_exited/i,
    title: "Cancelled",
  },
  {
    test: /sponsored submit is not configured|fee-free|fee_payer|fee payer/i,
    title: "Unavailable",
  },
  {
    test: /timed out waiting for sponsored/i,
    title: "Taking Too Long",
  },
  {
    test: /tap proof expired|slot hash no longer valid/i,
    title: "This Expired",
  },
  {
    test: /slot hashes|slot hash/i,
    title: "Couldn’t Finish",
  },
  {
    test: /owner mismatch|OwnerMismatch/i,
    title: "Wrong Wallet",
  },
  {
    test: /this tap was already used/i,
    title: "Already Used",
  },
  {
    test: /this is not the same phygital token/i,
    title: "Couldn’t Verify",
  },
  {
    test: /couldn't verify this phygital token|message mismatch/i,
    title: "Couldn’t Verify",
  },
  {
    test: /isn't set up|not registered/i,
    title: "Not Set Up",
  },
  {
    test: /missing tap parameters|verification failed|invalid signature/i,
    title: "Couldn’t Verify",
  },
  {
    test: /connect your wallet|connect a wallet|sign in to continue|create a passkey first/i,
    title: "Create a passkey",
  },
  {
    test: /phygital token not found|missing passkey/i,
    title: "Not Found",
  },
];

function rawMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "";
}

function matchRule(raw: string): Rule | null {
  return RULES.find((rule) => rule.test.test(raw)) ?? null;
}

function isAlreadyFriendly(raw: string): boolean {
  return (
    !/[_\-]{2,}|\b(sysvar|u64|PDA|ATA|RPC|D1|KV)\b/i.test(raw) &&
    raw.length < 140 &&
    !/^[A-Z][a-z]+[A-Z]/.test(raw)
  );
}

function logPaymentError(scope: string, error: unknown): void {
  const raw = rawMessage(error).trim();
  if (raw) {
    console.error(`[error:${scope}]`, raw, error);
    return;
  }
  if (error != null) {
    console.error(`[error:${scope}]`, error);
  }
}

/** Compact line for API error bodies. */
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
