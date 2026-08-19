export const PREAUTH_TTL_SECONDS = 120;
/** Minimum gap between preauth opens for the same wallet (rate limit). */
export const PREAUTH_MIN_INTERVAL_SECONDS = 10;

export type PreauthGrant = {
  id: string;
  expiresAt: number;
};

export type GrantClaim = {
  grantId: string;
  wallet: string;
};

export type GrantPaymentStamp = {
  blockTime: number | null;
  recipient: string;
  amount: string;
  mint: string;
  signature: string;
};
