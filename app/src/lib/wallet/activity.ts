export type WalletActivityItem = {
  signature: string;
  slot: number;
  err: boolean;
  blockTime: number | null;
  label: string;
};
