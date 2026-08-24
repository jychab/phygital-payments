/** Lean DAS collectible for `/card` — not a payment (fungible) token. */
export type Collectible = {
  mint: string;
  name: string;
  image: string | null;
  collectionName: string | null;
};
