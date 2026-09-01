import { copy } from "@/lib/copy/phygital";
import {
  computeSpendableUi,
  isOwnerPayMintEnabled,
  type MintDelegateStatus,
  type OwnerPayMintMatch,
  type OwnerPayDelegates,
} from "@/lib/tokens/mint-delegate";
import {
  isDefaultMint,
  type PaymentTokenHolding,
} from "@/lib/tokens/payment-token";
import { isUnclaimedToken, type PhygitalToken } from "@/lib/phygital/token";

export type AccessoryPrimaryKind =
  | "claim"
  | "verify"
  | "authorize"
  | "pay"
  | "none";

export type AccessoryPrimaryAction = {
  kind: AccessoryPrimaryKind;
  label: string;
};

export type AccessoryStatusLine = {
  text: string;
  tone: "muted" | "primary";
};

export type AccessoryWalletHomeHeader = {
  subtitle: string;
  enabledSummary: string | null;
};

export type AccessoryHoldingRow = {
  holding: PaymentTokenHolding;
  enabled: boolean;
  subtitle: string | null;
};

/** Whether this accessory has a spending limit on any verified token. */
export function accessoryHasSpendingLimit(
  delegates: OwnerPayDelegates | undefined,
  tokenAddress: string,
): boolean {
  if (!delegates) return false;
  for (const match of delegates.byMint.values()) {
    if (
      String(match.token) === tokenAddress &&
      isOwnerPayMintEnabled(match)
    ) {
      return true;
    }
  }
  return false;
}

function mintMatchForAccessory(
  delegates: OwnerPayDelegates | undefined,
  tokenAddress: string,
  mint: string,
): OwnerPayMintMatch | undefined {
  const match = delegates?.byMint.get(mint);
  if (!match || String(match.token) !== tokenAddress) return undefined;
  return match;
}

/** Whether Pay is enabled for this mint on this accessory. */
export function accessoryMintPayEnabled(
  delegates: OwnerPayDelegates | undefined,
  tokenAddress: string,
  mint: string,
): boolean {
  const match = mintMatchForAccessory(delegates, tokenAddress, mint);
  return Boolean(match && isOwnerPayMintEnabled(match));
}

/** Count of holdings with an active spending limit on this accessory. */
export function accessoryEnabledMintCount(
  holdings: readonly PaymentTokenHolding[] | undefined,
  delegates: OwnerPayDelegates | undefined,
  tokenAddress: string,
): number {
  if (!holdings?.length) return 0;
  return holdings.filter((h) =>
    accessoryMintPayEnabled(delegates, tokenAddress, h.mint),
  ).length;
}

/** Task header above the token list on the accessory wallet home. */
export function deriveAccessoryWalletHomeHeader(args: {
  holdingsEmpty: boolean;
  enabledCount: number;
  totalCount: number;
}): AccessoryWalletHomeHeader {
  const { holdingsEmpty, enabledCount, totalCount } = args;
  const hasLimit = enabledCount > 0;

  if (holdingsEmpty) {
    return {
      subtitle: copy.pay.noTokensSubtitle,
      enabledSummary: null,
    };
  }

  const enabledSummary =
    hasLimit &&
    totalCount > 1 &&
    enabledCount > 0 &&
    enabledCount < totalCount
      ? copy.pay.enabledCountSummary(enabledCount, totalCount)
      : null;

  if (!hasLimit) {
    return {
      subtitle: copy.pay.enablePaySubtitle,
      enabledSummary: null,
    };
  }

  return {
    subtitle: copy.pay.payTokensSubtitle,
    enabledSummary,
  };
}

/** Enabled first, then USDC, then symbol. */
function sortAccessoryHoldings(
  holdings: readonly PaymentTokenHolding[],
  delegates: OwnerPayDelegates | undefined,
  tokenAddress: string,
): PaymentTokenHolding[] {
  return [...holdings].sort((a, b) => {
    const aEnabled = accessoryMintPayEnabled(delegates, tokenAddress, a.mint);
    const bEnabled = accessoryMintPayEnabled(delegates, tokenAddress, b.mint);
    if (aEnabled !== bEnabled) return aEnabled ? -1 : 1;
    const aUsdc = isDefaultMint(a.mint);
    const bUsdc = isDefaultMint(b.mint);
    if (aUsdc !== bUsdc) return aUsdc ? -1 : 1;
    return a.symbol.localeCompare(b.symbol);
  });
}

function spendableRowSubtitle(
  holding: PaymentTokenHolding,
  status: MintDelegateStatus,
): string {
  const spendable = computeSpendableUi(status, holding.decimals);
  return copy.pay.availableToPaySubtitle(spendable, holding.symbol);
}

/** Sorted holdings with pay state resolved once per row. */
export function buildAccessoryHoldingRows(
  holdings: readonly PaymentTokenHolding[],
  delegates: OwnerPayDelegates | undefined,
  tokenAddress: string,
): AccessoryHoldingRow[] {
  return sortAccessoryHoldings(holdings, delegates, tokenAddress).map(
    (holding) => {
      const match = mintMatchForAccessory(delegates, tokenAddress, holding.mint);
      const enabled = Boolean(match && isOwnerPayMintEnabled(match));
      const subtitle =
        enabled && match?.status
          ? spendableRowSubtitle(holding, match.status)
          : `${holding.balanceUi} ${holding.symbol}`;
      return { holding, enabled, subtitle };
    },
  );
}

export function deriveAccessoryPrimaryAction(args: {
  token: PhygitalToken;
  liveConfirmed: boolean;
  canClaim: boolean;
  preConfirmationOn: boolean;
  keyReady: boolean;
  hasLimit: boolean;
  canPay: boolean;
}): AccessoryPrimaryAction {
  const {
    token,
    liveConfirmed,
    canClaim,
    preConfirmationOn,
    keyReady,
    hasLimit,
    canPay,
  } = args;

  if (isUnclaimedToken(token) || canClaim) {
    return { kind: "claim", label: copy.claim.addToWallet };
  }
  if (!liveConfirmed) {
    return { kind: "verify", label: copy.verify.holdToCheck };
  }
  if (canPay && preConfirmationOn && !keyReady && hasLimit) {
    return { kind: "authorize", label: copy.pay.authorizePhone };
  }
  if (canPay && preConfirmationOn && keyReady && hasLimit) {
    return { kind: "pay", label: copy.pay.pay };
  }
  return { kind: "none", label: "" };
}

export function deriveAccessoryStatusLine(args: {
  preConfirmationOn: boolean;
  keyReady: boolean;
  hasLimit: boolean;
  canPay: boolean;
}): AccessoryStatusLine | null {
  const { preConfirmationOn, keyReady, hasLimit, canPay } = args;
  if (!canPay || !hasLimit) return null;

  if (preConfirmationOn && !keyReady) {
    return {
      text: copy.pay.holdNeedsKey,
      tone: "muted",
    };
  }
  if (preConfirmationOn && keyReady) {
    return {
      text: copy.pay.preConfirmationOnHint,
      tone: "primary",
    };
  }
  return {
    text: copy.pay.preConfirmationOffHint,
    tone: "muted",
  };
}
