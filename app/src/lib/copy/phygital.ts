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
  /** Cold NFC / Hold-to-Check landing (tap the ring). */
  verifyIntroBody:
    "Hold your item flat against the back of this phone, then tap the ring.",
  /** Tap URL or verification session timed out — user must hold again. */
  verifySessionExpiredTitle: "Session ended",
  verifySessionExpiredBody:
    "Your last check timed out. Hold your item here again, then tap the ring to continue.",
  /** Live re-check after Verified (ceremony title). */
  confirmPresence: "Verifying...",
  confirmPresenceBody:
    "Hold your item flat against the back of this phone.",
  /** Shown under Verified when tappable for re-verify. */
  confirmPresenceHint: "Tap to verify again",
  /** After a successful re-verify from Verified. */
  confirmedAgain: "Verified",
  confirmedAgainBody: "This item is authentic.",
  /** Hold / re-check failed — full-screen retry (no return to detail). */
  verifyFailed: "Couldn't verify",
  confirmFailed: "Couldn't verify",
  verifyFailedBody:
    "Hold your item flat against the back of your phone and tap the ring to try again.",
  verifyFailedRetry: "Tap the ring to try again.",
  /** Accessible name for failed-screen ring retry. */
  verifyFailedRetryAria: "Tap to verify again.",
  /** Accessible name when Verified row is tappable. */
  confirmedRecheckAria: "Verified. Tap to verify again.",
  holdStill: "Hold still…",
  holdStillBody: "Keep your item against the phone until this finishes.",
  connectWallet: "Connect wallet",
  addToWallet: "Add to Wallet",
  holdToCollect: "Hold to Collect",
  backToCollection: "Back to Collection",
  /** Metadata row labels. */
  verification: "Verification",
  cardOwner: "Card Owner",
  linked: "Linked",
  mintOwner: "Mint Owner",
  cardId: "Card ID",
  cardIdHint:
    "The card’s secp256r1 public key (credential ID) — the unique identity of this physical card.",
  owner: "Owner",
  rarity: "Rarity",
  notVerified: "Not verified",
  verified: "Verified",
  notVerifiedHint:
    "Tap Verify and hold your item here to confirm it's authentic.",
  verifyAgain: "Verify again",
  verifyAgainHint: "Hold here to re-check",
  signedInAsOwner: "You're signed in as the owner.",
  /** Unminted status when not yet verified this visit. */
  notVerifiedYet: "Not verified yet.",
  /** Tap-URL proof — authentic open, not a fresh presence check. */
  confirmedJustNow: "Verified from your tap",
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
  holdCardBody: "Hold your card flat against the back of this phone, then tap the ring.",
  holdItemBody:
    "Hold your item flat against the back of this phone, then tap the ring.",
  verifyingChip: "Checking your item…",
  notSetUpTitle: "Not set up",
  notSetUpBody: "This item isn't registered on Revibase yet.",
  amountLocked: "Amount set by payment link",
  collect: products.collect.name,
  getPaid: "Get paid",
  about: "About",
  attributes: "Attributes",
  shortcuts: "Shortcuts",
  details: "Details",
  mintDetails: "Mint details",
  cardDetails: "Card details",
  collection: "Collection",
  showMore: "Show more",
  showLess: "Show less",
  mintAddress: "Mint",
  collectionAddress: "Collection",
  notLinked: "Not linked",
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
