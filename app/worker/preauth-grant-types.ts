export const PREAUTH_TTL_SECONDS = 45;
/** Minimum gap between preauth opens for the same wallet (rate limit). */
export const PREAUTH_MIN_INTERVAL_SECONDS = 2;

export type PreauthGrant = {
  id: string;
  expiresAt: number;
};

export type GrantClaim = {
  grantId: string;
  wallet: string;
};
