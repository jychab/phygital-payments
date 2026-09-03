export type WalletCollectible = {
  mint: string;
  name: string;
  image: string | null;
  collectionName: string | null;
  interface: string;
  compressed: boolean;
  tokenProgram: string | null;
};
