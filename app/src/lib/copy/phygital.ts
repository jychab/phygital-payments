/**
 * Revibase brand stack — company first, products second.
 *
 * Company  → Revibase (wordmark on the owner hub)
 * Products → Collection | Pay | Collect
 * Objects  → Card | Accessory (within Collection / Pay)
 *
 * Do not brand every route as "Revibase Pay" — that collapses a multi-product
 * company into a single payments app.
 */

export const brand = {
  /** Company name — hub wordmark, document suffix, boot skeleton. */
  company: "Revibase",
  /** Short legal / footer form. */
  companyLegal: "Revibase",
} as const;

/**
 * Named products under Revibase. Use these in titles and chrome — not
 * inventing new product names per screen.
 */
export const products = {
  /** Owner hub: cards + accessories overview (`/`). */
  collection: {
    id: "collection",
    name: "Collection",
    title: "Collection — Revibase",
    tagline: "Your cards and accessories",
  },
  /** Payer NFC tap-to-pay (accessory task journey). */
  pay: {
    id: "pay",
    name: "Pay",
    title: "Pay — Revibase",
    tagline: "Tap to pay with your accessory",
  },
  /** Merchant receive (`/collect`). */
  collect: {
    id: "collect",
    name: "Collect",
    title: "Collect — Revibase",
    tagline: "Collect a payment with a tap",
  },
} as const;

export type ProductId = keyof typeof products;

/** Document titles for object / task surfaces. */
export const pageTitles = {
  home: products.collection.title,
  card: "Card — Revibase",
  accessory: "Accessory — Revibase",
  collect: products.collect.title,
} as const;

/** Shared product copy — keep verbs and status labels consistent. */
export const copy = {
  holdToCheck: "Hold to Check",
  holdStill: "Hold Still…",
  holdStillBody: "Keep holding until it reads.",
  connectWallet: "Connect wallet",
  addToWallet: "Add to Wallet",
  holdToCollect: "Hold to Collect",
  backToCollection: "Back to Collection",
  registered: "Registered",
  confirmed: "Confirmed",
  registeredOnChain: "Registered on-chain.",
  confirmedJustNow: "Confirmed just now.",
/** Collection → detail; Confirmed copy when owner session verified (not URL alone). */
  verifiedFromCollection: "Verified from your Collection.",
  connectCollectionBody: "Connect to see your cards and accessories.",
  claimNetworkFee:
    "You'll pay a small network fee when you confirm in your wallet.",
  holdToAdd: "Hold to Add",
  claimStepHold: "Hold to add",
  claimStepConfirm: "Confirm in wallet",
  verifyingChip: "Verifying chip signature…",
  amountLocked: "Amount set by payment link",
} as const;
