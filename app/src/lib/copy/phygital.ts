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
  token: "Token — Revibase",
  collect: products.collect.title,
} as const;

  /** Shared product copy — keep verbs and status labels consistent. */
export const copy = {
  /** First-time authenticity CTA in the sticky dock. */
  holdToCheck: "Verify",
  /** Live re-check after Confirmed (badge / title affordance). */
  confirmPresence: "Confirm it’s with you",
  confirmPresenceBody: "Hold your item to the back of this phone.",
  /** Accessible name when Confirmed is tappable. */
  confirmedRecheckAria: "Confirmed. Confirm it’s with you.",
  holdStill: "Hold still…",
  holdStillBody: "Keep your item against the phone.",
  connectWallet: "Connect wallet",
  addToWallet: "Add to Wallet",
  holdToCollect: "Hold to Collect",
  backToCollection: "Back to Collection",
  registered: "Registered",
  confirmed: "Confirmed",
  registeredOnChain: "Registered on-chain.",
  /** Tap-URL proof — authentic open, not a fresh presence check. */
  confirmedJustNow: "Confirmed from this tap.",
  /** Collection → detail; owner session matched. */
  verifiedFromCollection: "Verified in your Collection.",
  connectCollectionBody: "Connect to see your cards and accessories.",
  /** Claim ready primary — NFC hold is in the body, not the button. */
  holdToAdd: "Continue",
  claimStepHold: "Hold",
  claimStepConfirm: "Confirm",
  claimReadyBody: (noun: "card" | "accessory") =>
    `Hold your ${noun} to the back of this phone, then connect a wallet.`,
  claimConfirmBody: (noun: "card" | "accessory") =>
    `Connect the wallet that should own this ${noun}.`,
  claimConfirmTitle: "Link your wallet",
  openInBrowser:
    "Open this link in your phone’s browser to continue.",
  holdCardBody: "Hold your card to the back of this phone.",
  holdItemBody: "Hold your item to the back of this phone.",
  verifyingChip: "Verifying…",
  amountLocked: "Amount set by payment link",
  collect: products.collect.name,
  getPaid: "Get paid",
  about: "About",
  attributes: "Attributes",
  shortcuts: "Shortcuts",
  details: "Details",
  showMore: "Show more",
  showLess: "Show less",
  mintAddress: "Mint",
  collectionAddress: "Collection",
  notLinked: "Not linked to a wallet.",
  linkedTo: (short: string) => `Linked to ${short}.`,
} as const;

export {
  formatRarityPercent,
  formatRarityRank,
  formatRarityRankWithTie,
  formatTraitRarityLine,
} from "@/lib/tokens/rarity/format";

/**
 * Revibase Pay surface copy — Collection and NFC accessory share these strings.
 * Product name on setup/settings; short **Pay** only for the arm-payment action.
 */
export const payCopy = {
  product: "Revibase Pay",
  /** Primary action — arm a payment window. */
  pay: "Pay",
  setUp: "Set up Revibase Pay",
  manage: "Manage Revibase Pay",
  settings: "Manage Revibase Pay",
  connectLinked: "Connect linked wallet",
  manageConnectBody: (ownerShort: string) =>
    `Connect ${ownerShort} to manage Revibase Pay on this accessory.`,
  enableTitle: "Enable Revibase Pay",
  enableSubtitle:
    "Generate a key for this browser, or import one you already have.",
  setUpSubtitle: "Import a key from another browser, or generate a new one.",
  finishSetupTitle: "Finish Revibase Pay setup",
  finishSetupKeyBody:
    "Confirmation is on. Set up Revibase Pay in this browser to continue.",
  finishSetupLimitBody: "Connect the linked wallet to set a spending limit.",
  holdNeedsKey:
    "Confirmation is on. Generate or import an API key to enable Revibase Pay.",
  holdReady: "Press Pay, then hold your accessory to their phone.",
  holdConfirmOff: "Hold your accessory to their phone to pay.",
  onToast: "Revibase Pay is on",
  importKey: "Import API key",
  generateKey: "Generate API key",
  rotateKey: "Rotate API key",
  manageKey: "Manage API key",
  loading: "Loading Pay…",
} as const;
