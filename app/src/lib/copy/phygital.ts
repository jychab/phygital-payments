/**
 * Revibase brand stack — company first, products second.
 *
 * All user-facing UX strings live here. Import nested groups:
 * `copy.verify.holdToCheck`, `copy.wallet.*`, etc.
 */

export const brand = {
  company: "Revibase",
  companyLegal: "Revibase",
} as const;

export const products = {
  recents: {
    id: "recents",
    name: "Recents",
    title: "Recents — Revibase",
    tagline: "Cards and accessories you’ve tapped",
  },
} as const;

export const copy = {
  common: {
    tryAgain: "Try again",
    done: "Done",
    cancel: "Cancel",
    loading: "Loading…",
    back: "Back",
    close: "Close",
    wallet: "Wallet",
  },
  wallet: {
    copyAddress: "Copy address",
    addressCopied: "Address copied",
    addressCopyFailed: "Couldn’t copy address",
    openWalletAria: (label: string) => `Open wallet ${label}`,
    copyAddressAria: (label: string) => `Copy address ${label}`,
    availableBalance: "Available balance",
    addMoney: "Add money to get started",
    send: "Send",
    receive: "Receive",
    tokens: "Tokens",
    collectibles: "Collectibles",
    settings: "Settings",
    signing: "Signing",
    backToCard: "Card",
    holdToSend: "Hold to send",
    holdToReceive: "Hold to receive",
    holdToSave: "Hold to save",
    sent: "Sent",
    received: "Received",
    ofAvailable: (available: string) => `of $${available} available`,
    to: "To",
    from: "From",
    pasteAddress: "Paste address",
    tapAccessory: "Tap accessory",
    tapTheirAccessory: "Tap their accessory",
    accessoryLinked: "Accessory linked",
    clear: "Clear",
    shareAddress: "Share this address",
    receiveNearby: "Receive nearby",
    receiveNearbyHint: "They hold their accessory here",
    signingBody:
      "Revibase signs with you when you tap. Change only if you trust another service.",
    signingCurrent: "Current",
    signingDefault: "Revibase",
    useCustomSigning: "Use custom service…",
    customEndpoint: "Endpoint URL",
    customVerifier: "Verifier address",
    approveSendTitle: "Approve this send?",
    approveSendBodyLimit: (limit: string) =>
      `This is over your $${limit} limit.`,
    approveSendBodyRecipient: "This address isn’t on your allowed list.",
    approveSendBodyTime: "Sending isn’t allowed right now.",
    approveOnce: "Approve once",
    changeLimits: "Change limits",
    holdToUnlock: "Hold to unlock",
    sessionExpiredBody: "Hold your item to continue.",
    sendBlockedHard:
      "This payment isn’t allowed by your settings. Change limits in Settings.",
    spendingLimits: "Spending limits",
    spendingLimitsHint: "You can still approve a larger send once.",
    maxPerSend: "Max per send",
    recipients: "Recipients",
    recipientsAnyone: "Anyone",
    recipientsAllowlist: "Allow list only",
    recipientsBlocked: "Blocked addresses",
    allowedActions: "Allowed actions",
    paymentsOnly: "Payments only",
    advancedPrograms: "Custom programs",
    save: "Save",
    settingsSaved: "Settings saved",
  },
  recents: {
    heading: "Recents",
    emptyTitle: "Nothing here yet",
    emptyBody: "Hold a card or accessory to this phone.",
    card: "Card",
    accessory: "Accessory",
  },
  address: {
    default: "address",
    wallet: "wallet",
    linkedWallet: "linked wallet",
    mintAddress: "token ID",
    mintOwner: "owner wallet",
    cardId: "card ID",
    recipient: "recipient",
    walletAddress: "wallet address",
    copiedToClipboard: "Copied to clipboard",
    copyAria: (label: string, addr: string) => `Copy ${label} ${addr}`,
    copiedAria: (label: string) => `Copied ${label}`,
  },
  verify: {
    holdToCheck: "Verify",
    introBody: "Hold your item flat against the back of this phone.",
    sessionExpiredTitle: "Verification timed out",
    sessionExpiredBody: "Hold your item here again.",
    verifying: "Verifying…",
    verifyAgain: "Verify again",
    verifyAgainHint: "Hold here to re-check",
    verified: "Verified",
    verifiedAgainBody: "This item is authentic.",
    failed: "Couldn’t verify",
    failedBody:
      "Hold your item flat against the back of your phone and try again.",
    holdStill: "Hold still…",
    holdStillBody: "Keep your item against the phone until this finishes.",
    verifiedRecheckAria: "Verified. Verify again.",
    notVerified: "Not verified",
    notVerifiedHint:
      "Hold your item here, then tap Verify.",
    verifyingChip: "Checking your item…",
    notSetUpTitle: "Not set up",
    notSetUpBody: "This item isn't registered on Revibase yet.",
  },
  token: {
    verification: "Verification",
    linked: "Linked",
    notLinked: "Not linked",
    mintOwner: "Owner wallet",
    cardId: "Card ID",
    cardIdHint: "A unique ID for this physical card.",
    rarity: "Rarity",
    about: "About",
    attributes: "Attributes",
    details: "Details",
    collection: "Collection",
    showMore: "Show more",
    showLess: "Show less",
    mintAddress: "Token ID",
    itemLoadFailed: "Couldn’t load item",
    itemNotOnChain: "This item may no longer be available.",
  },
  shortcut: {
    heading: "Shortcuts",
    openInBrowser: "Open in browser",
    embedBlocked: "This site can't be shown here.",
  },
  gate: {
    openInBrowserTitle: "Open in your browser",
    openInBrowserBody: "Open this link in your phone’s browser to continue.",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    linkCopyFailed: "Couldn’t copy link",
  },
  embed: {
    cantOpenTitle: "Can’t open here",
    tokenBody: "Open this on your phone, not in this window.",
  },
} as const;

/** User-facing send / verify error titles and bodies (see user-errors.ts). */
export const errorCopy = {
  fallback: {
    title: "Not Completed",
    body: "Something went wrong. Try again.",
  },
  couldntVerify: {
    title: "Couldn't Verify",
    body: "Hold your item here again and try once more.",
  },
  notEnoughMoney: {
    title: "Not Enough Money",
    body: "There isn’t enough in this wallet for this amount.",
  },
  paymentFailed: {
    title: "Not Completed",
    body: "This couldn’t go through. Check the amount and try again.",
  },
  accessoryLocked: {
    title: "Accessory Locked",
    body: "This accessory can’t send right now.",
  },
  sessionEnded: {
    title: "Verification timed out",
    body: "Hold your item here again to verify.",
  },
  accessoryNotReady: {
    title: "Accessory Isn’t Ready",
    body: "This accessory isn’t ready to send yet.",
  },
  wrongItem: {
    title: "Different item",
    body: "Hold the same item flat against the back of your phone.",
  },
  nfcVerifyFailed: {
    title: "Couldn’t verify",
    body: copy.verify.failedBody,
  },
  notSetUp: {
    title: copy.verify.notSetUpTitle,
    body: copy.verify.notSetUpBody,
  },
  itemNotFound: {
    title: "Item not found",
    body: "Hold your item here again to verify.",
  },
  enterAmount: {
    title: "Enter an amount",
    body: "Enter a valid amount.",
  },
  amountTooPrecise: {
    title: "Amount Too Precise",
    body: "Use fewer decimal places.",
  },
  tryAgainBody: {
    title: "Not completed",
    body: "Something went wrong. Try again.",
  },
} as const;
