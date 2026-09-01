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

/** Shared product copy — keep verbs and status labels consistent. */
export const copy = {
  /** First-time authenticity CTA in the sticky dock. */
  holdToCheck: "Verify",
  /** Cold NFC / Hold-to-Check landing — hold instruction; Verify is the button. */
  verifyIntroBody:
    "Hold your item flat against the back of this phone.",
  /** Tap URL or verification session timed out — user must hold again. */
  verifySessionExpiredTitle: "Session ended",
  verifySessionExpiredBody:
    "Your last check timed out. Hold your item here again.",
  /** Live re-check after Verified (ceremony title). */
  confirmPresence: "Verifying...",
  confirmPresenceBody:
    "Hold your item flat against the back of this phone.",
  /** Shown under Verified when tappable for re-verify. */
  verifyAgain: "Verify again",
  /** After a successful re-verify from Verified. */
  confirmedAgain: "Verified",
  confirmedAgainBody: "This item is authentic.",
  /** Hold / re-check failed — full-screen retry (no return to detail). */
  verifyFailed: "Couldn't verify",
  confirmFailed: "Couldn't verify",
  verifyFailedBody:
    "Hold your item flat against the back of your phone and try again.",
  tryAgain: "Try again",
  /** Accessible name when Verified row is tappable. */
  confirmedRecheckAria: "Verified. Verify again.",
  holdStill: "Hold still…",
  holdStillBody: "Keep your item against the phone until this finishes.",
  connectWallet: "Connect wallet",
  addToWallet: "Add to Wallet",
  holdToCollect: "Hold to Collect",
  backToCollection: "Back to Collection",
  /** Metadata row labels. */
  verification: "Verification",
  linked: "Linked",
  mintOwner: "Mint Owner",
  cardId: "Card ID",
  cardIdHint:
    "The card’s secp256r1 public key (credential ID) — the unique identity of this physical card.",
  rarity: "Rarity",
  notVerified: "Not verified",
  verified: "Verified",
  notVerifiedHint:
    "Hold your item here, then press Verify to confirm it's authentic.",
  verifyAgainHint: "Hold here to re-check",
  signedInAsOwner: "You're signed in as the owner.",
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
  verifyingChip: "Checking your item…",
  notSetUpTitle: "Not set up",
  notSetUpBody: "This item isn't registered on Revibase yet.",
  amountLocked: "Amount set by payment link",
  collect: products.collect.name,
  about: "About",
  attributes: "Attributes",
  shortcuts: "Shortcuts",
  details: "Details",
  collection: "Collection",
  showMore: "Show more",
  showLess: "Show less",
  mintAddress: "Mint",
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
  /** Primary action — arm a payment window. */
  pay: "Pay",
  paySettings: "Pay settings",
  receive: "Receive",
  accessory: "Accessory",
  linkedWallet: "Linked wallet",
  payEnabled: "Enabled",
  enablePaySubtitle:
    "Choose a token from your linked wallet. Set how much this accessory can spend.",
  payTokensSubtitle:
    "Balances in your linked wallet. Tap to change a limit.",
  noTokensSubtitle: "Fund this wallet to enable Pay on a token.",
  enabledCountSummary: (enabled: number, total: number) =>
    `${enabled} of ${total} tokens enabled for Pay`,
  spendingLimitSubtitle: (amount: string, isUsdc: boolean) =>
    isUsdc ? `$${amount} spending limit` : `${amount} spending limit`,
  enableToken: "Enable",
  editLimit: "Edit",
  authorizePhone: "Authorize this phone",
  preConfirmation: "Pre-confirmation",
  preConfirmationOnHint: "Press Pay here first, then hold.",
  preConfirmationOffHint: "Hold your accessory at their phone.",
  preConfirmationOnSubtitle:
    "Press Pay here first, then hold. The window is armed before money moves.",
  preConfirmationOffSubtitle:
    "Hold the accessory at their phone. No step on this phone.",
  thisPhone: "This phone",
  authorizeTitle: "Authorize this phone",
  authorizeSubtitle:
    "Sign with your linked wallet to enable pre-confirmation on this phone.",
  rotateTitle: "Replace this phone’s key?",
  rotateSubtitle: "Other phones will stop working. This phone stays on.",
  holdNeedsKey:
    "Pre-confirmation is on. Authorize this phone to enable Pay.",
  onToast: "Pay is ready on this phone",
  issueKey: "Authorize this phone",
  rotateKey: "Rotate key",
  loading: "Loading Pay…",
} as const;
