/**
 * Revibase brand stack — company first, products second.
 *
 * All user-facing UX strings live here. Import nested groups:
 * `copy.verify.holdToCheck`, `copy.pay.paySettings`, `copy.wallet.*`, etc.
 */

export const brand = {
  company: "Revibase",
  companyLegal: "Revibase",
} as const;

export const products = {
  collection: {
    id: "collection",
    name: "Collection",
    title: "Collection — Revibase",
    tagline: "Your cards and accessories",
  },
  pay: {
    id: "pay",
    name: "Pay",
    title: "Pay — Revibase",
    tagline: "Tap to pay with your accessory",
  },
  collect: {
    id: "collect",
    name: "Collect",
    title: "Collect — Revibase",
    tagline: "Collect a payment with a tap",
  },
} as const;

export const copy = {
  common: {
    tryAgain: "Try again",
    done: "Done",
    cancel: "Cancel",
    loading: "Loading…",
    connectWallet: "Connect wallet",
    connectWalletTitle: "Connect your wallet",
    connectShort: "Connect",
    activity: "Activity",
    back: "Back",
    close: "Close",
    show: "Show",
    hide: "Hide",
    disconnect: "Disconnect",
    remove: "Remove",
    wallet: "Wallet",
    selected: "Selected",
  },
  wallet: {
    wrongWalletTitle: "Wrong wallet",
    wrongWalletNotice: (ownerShort: string) =>
      `Wrong wallet. Disconnect above, then connect ${ownerShort}.`,
    wrongWalletPageBody: (ownerShort: string) =>
      `This page is for ${ownerShort}. Disconnect above, then connect that wallet.`,
    connectHint: (ownerShort: string) =>
      `Connect ${ownerShort} to continue.`,
    connectToAuthorize: (ownerShort: string) =>
      `Connect ${ownerShort} to authorize this phone.`,
    connectToRotate: (ownerShort: string) =>
      `Connect ${ownerShort} to rotate this phone’s key.`,
    connectToChangeLimit: (ownerShort: string) =>
      `Connect ${ownerShort} to change this limit.`,
    copyAddress: "Copy address",
    showPrivateKey: "Show private key",
    addressCopied: "Address copied",
    addressCopyFailed: "Couldn’t copy address",
    privateKeyFailed: "Couldn’t show private key",
    loginFailed: "Couldn’t open wallet login",
    googleWalletMenu: "Google wallet menu",
    walletMenu: "Wallet menu",
    walletMenuNamed: (name: string) => `${name} menu`,
    stillLoadingTitle: "Wallet is still loading",
    stillLoadingBody: "Try Connect again in a moment.",
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
  claim: {
    addToWallet: "Add to Wallet",
    holdToAdd: "Hold to continue",
    stepHold: "Hold",
    stepConfirm: "Confirm",
    confirmTitle: "Choose owner wallet",
    readyBody: (noun: "card" | "accessory") =>
      `Hold your ${noun} flat against the back of this phone.`,
    holdStepTitle: (noun: "card" | "accessory") => `Hold your ${noun}`,
    holdStepBody: "Keep it flat against the back of this phone until it connects.",
    confirmBody: (noun: "card" | "accessory") =>
      `Connect the wallet that will own this ${noun}.`,
    moveToNewWallet: "Transfer to another wallet",
    confirmInWalletTitle: "Confirm in wallet…",
    confirmInWalletBody: "Approve in your wallet to continue.",
    confirmInWalletButton: "Confirm in wallet",
    connectOwnerBody: (noun: "card" | "accessory") =>
      `This wallet will own the ${noun}.`,
    captureFailed: (noun: "card" | "accessory") =>
      `Couldn’t add this ${noun}. Try again.`,
    readFailed: (noun: "card" | "accessory") =>
      `Couldn’t read the ${noun}. Turn on NFC and hold it to the back of your phone.`,
    finishFailed:
      "Transaction wasn’t approved. Try again in your wallet.",
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
  },
  collection: {
    loading: "Loading your collection…",
    loadFailedTitle: "Couldn’t load collection",
    loadFailedBody: "Check your connection and try again.",
    heading: "Your Collection",
    cardsAria: "Cards",
    emptyTitle: "No cards yet",
    emptyBody:
      "Hold a card flat against the back of your phone to add it to your collection.",
    accessoriesHeading: "Accessories",
    connectBody: "Connect to see your cards and accessories.",
    activityEmpty: "When you send or receive payments, they’ll show up here.",
    activityLoadFailed: "Couldn’t load activity",
    itemLoadFailed: "Couldn’t load item",
    itemNotOnChain: "This item may no longer be available.",
    manageNoun: (noun: "card" | "accessory") => `Manage ${noun}`,
    lock: "Lock",
    unlock: "Unlock",
    removeFromWallet: "Remove from wallet",
    removeConfirmTitle: (noun: "card" | "accessory") => `Remove ${noun}?`,
    removeConfirmBody: (noun: "card" | "accessory") =>
      `Remove this ${noun} from your collection? Someone else can add it afterward.`,
    nounLocked: (noun: "card" | "accessory") =>
      noun === "card" ? "Card locked" : "Accessory locked",
    nounUnlocked: (noun: "card" | "accessory") =>
      noun === "card" ? "Card unlocked" : "Accessory unlocked",
    lockFailed: (noun: "card" | "accessory") => `Couldn’t lock this ${noun}`,
    unlockFailed: (noun: "card" | "accessory") =>
      `Couldn’t unlock this ${noun}`,
    nounRemoved: (noun: "card" | "accessory") =>
      noun === "card" ? "Card removed" : "Accessory removed",
    removeFailed: (noun: "card" | "accessory") => `Couldn’t remove this ${noun}`,
    sent: "Sent",
    from: "from",
    to: "to",
  },
  collect: {
    amountLocked: "Amount set by payment link",
    holdToCollect: "Hold to collect",
    received: "Received",
    processing: "Processing",
    holdTitle: "Hold their accessory here",
    holdBody: "Keep holding until you feel it connect.",
    confirmingBody: "Just a moment.",
    inAppBody: "To collect a payment, open this page in Safari or Chrome.",
    inAppTitle: "Open in Safari or Chrome",
    linkInvalidTitle: "This payment link isn’t set up",
    linkInvalidBody: "This link is incomplete. Ask the seller to send a new one.",
    linkMissingRecipientBody:
      "Open a payment link with a recipient address, or ask the seller for one.",
    connectBody: "Payments will be sent to the wallet you connect.",
    ataTitle: "Set up to receive payments",
    ataNotReadyPrefix: "This wallet isn’t ready to receive",
    ataNotReadySuffix: "yet.",
    readyToReceive: "Ready to receive",
    setupFailed: "Couldn’t set up to receive",
    settingUp: "Setting up…",
    createAta: (symbol: string) => `Set up ${symbol}`,
    chooseToken: "Choose a token",
    searchTokens: "Search tokens",
    supportedTokensOnly: "Supported tokens only",
    noTokensMatch: "No tokens match.",
    enterAmountBody:
      "Enter an amount, then hold their accessory to your phone.",
    toLabel: "To",
    checking: "Checking…",
    finishSetupInAppPrefix: "Open this page in Safari or Chrome to finish",
    finishSetupInAppSuffix: "setup, then come back.",
    noFee: "No network fee",
    switchToUsdc: "Switch to USDC",
    tokenNotSupportedBody:
      "Only supported tokens can be collected. Switch to USDC to continue.",
  },
  pay: {
    pay: "Pay",
    paySettings: "Pay settings",
    receive: "Receive",
    accessory: "Accessory",
    linkedWallet: "Linked wallet",
    payEnabled: "Enabled",
    enablePaySubtitle: "Pick a token and set an allowance.",
    payTokensSubtitle: "Tap a token to change its allowance.",
    noTokensSubtitle: "Fund this wallet to enable Pay on a token.",
    enabledCountSummary: (enabled: number, total: number) =>
      `${enabled} of ${total} tokens enabled for Pay`,
    availableToPaySubtitle: (amount: string, symbol: string) =>
      `${amount} ${symbol} available`,
    enableToken: "Enable",
    authorizePhone: "Authorize this phone",
    preConfirmation: "Pre-confirmation",
    preConfirmationOnHint: "Press Pay here first, then hold.",
    preConfirmationOffHint: "Hold your accessory at their phone.",
    preConfirmationOnSubtitle:
      "Press Pay here first, then hold. The window is armed before money moves.",
    preConfirmationOffSubtitle:
      "Hold the accessory at their phone. No step on this phone.",
    thisPhone: "This phone",
    authorizeTitle: "Allow this phone to pay",
    authorizeSubtitle:
      "Sign with your linked wallet to enable pre-confirmation on this phone.",
    rotateTitle: "Replace this phone’s key?",
    rotateSubtitle: "Other phones will stop working. This phone stays on.",
    holdNeedsKey: "Pre-confirmation is on. Authorize this phone to enable Pay.",
    onToast: "This phone is ready to pay",
    issueKey: "Authorize this phone",
    rotateKey: "Rotate key",
    loadingLabel: "Loading Pay…",
    settingsPreConfirmation: "Pre-confirmation and this phone.",
    settingsAccessoryPays: "How this accessory pays.",
    authorizedOnPhone: "Authorized on this phone",
    preConfirmationWorks: "Pre-confirmation works here.",
    manage: "Manage",
    authorize: "Authorize",
    paid: "Paid",
    holdToPay: "Hold to pay",
    confirmingPayment: "Confirming payment…",
    cancelled: "Cancelled",
    cancelledBody: "Nothing was charged.",
    replacedTitle: "New payment started",
    replacedBody: "Continue with the new payment.",
    expiredTitle: "Time expired",
    expiredBody: "Press Pay again to continue.",
    payAgain: "Pay again",
    preauthCancelled: "Cancelled. Nothing was charged.",
    preauthReplaced: "A new payment started.",
    preauthExpired: "Time expired. Press Pay again to continue.",
    preauthOpened: (minutes: number) =>
      minutes === 1
        ? "Ready to pay · 1 minute left"
        : `Ready to pay · ${minutes} minutes left`,
    spendingLimitTitle: "Pay allowance",
    spendingLimitSubtitleNew: "Set how much this accessory can spend.",
    spendingLimitSubtitleEdit: "Change the remaining allowance.",
    setLimit: "Set allowance",
    updateLimit: "Save",
    confirmInWallet: "Confirm in wallet…",
    removing: "Removing…",
    removeSpendingLimit: "Turn off",
    stillLoading: "Still loading. Try again in a moment.",
    enterValidAmount: "Enter a valid amount",
    limitSaved: "Pay allowance saved",
    limitSaveFailed: "Couldn’t save pay allowance",
    limitRemoved: "Pay allowance removed",
    limitRemoveFailed: "Couldn’t remove pay allowance",
    setupTokenAccountTitle: (symbol: string) => `Set up ${symbol}`,
    setupTokenAccountBody: (symbol: string) =>
      `Add ${symbol} to this wallet first.`,
    setupTokenAccount: (symbol: string) => `Set up ${symbol}`,
    settingUpTokenAccount: "Setting up…",
    setupTokenAccountFailed: "Couldn’t set up token account",
    setupTokenAccountDone: "Ready to set allowance",
    preauthUpdateFailed: "Couldn’t update pre-confirmation.",
    rotateSuccessToast: "Other phones will stop working.",
    rotateFailed: "Couldn’t rotate key",
    authorizeFailed: "Couldn’t authorize this phone",
    authorizing: "Authorizing…",
    rotating: "Rotating…",
    phoneCanStartPay: "This phone can start Pay before you hold.",
    paymentCheckFailed: "Couldn’t check this payment.",
    paymentStartFailed: "Couldn’t start this payment.",
    cancelFailed: "Couldn’t cancel.",
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
    homeBody: "Use a payment link instead.",
  },
} as const;

/** User-facing payment / verify error titles and bodies (see user-errors.ts). */
export const errorCopy = {
  fallback: {
    title: "Payment Not Completed",
    body: "Something went wrong. Try again.",
  },
  couldntVerify: {
    title: "Couldn't Verify",
    body: "Disconnect, reconnect, and try again.",
  },
  notEnoughMoney: {
    title: "Not Enough Money",
    body: "There isn’t enough in this wallet for this amount.",
  },
  paymentFailed: {
    title: "Payment Not Completed",
    body: "This payment couldn’t go through. Check the amount and try again.",
  },
  alreadyAdded: {
    title: "Already Added",
    body: "This accessory is already on that wallet.",
  },
  accessoryLocked: {
    title: "Accessory Locked",
    body: "Unlock this accessory, then try again.",
  },
  finishSetup: {
    title: "Finish setup",
    body: "This wallet isn’t ready to receive yet. Finish setup, then try again.",
  },
  alreadyUsed: {
    title: "Already Used",
    body: "Ask them to press Pay again, then hold their accessory here.",
  },
  payNotReady: {
    title: "Pay Isn’t Ready",
    body: "Ask them to press Pay on their phone, then hold their accessory here.",
  },
  tokenNotOn: {
    title: "This Token Isn’t On",
    body: "Ask them to set a spending limit for this token, then try again.",
  },
  overLimit: {
    title: "Over the Limit",
    body: "This is more than their spending limit. Ask them to raise it, or collect less.",
  },
  tryAgainShortly: {
    title: "Try Again Shortly",
    body: "Too many attempts. Wait a moment and try again.",
  },
  wrongWallet: {
    title: "Wrong Wallet",
    body: "That belongs to a different wallet.",
  },
  payReset: {
    title: "Pay Was Reset",
    body: "Turn on Pay again.",
  },
  didntWork: {
    title: "That Didn’t Work",
    body: "Authorize this phone in Pay settings, then try again.",
  },
  payNotSetUp: {
    title: "Pay isn’t set up on this phone",
    body: "Authorize this phone in Pay settings first.",
  },
  paymentNotFound: {
    title: "Payment Not Found",
    body: "Press Pay again to continue.",
  },
  cancelled: {
    title: "Cancelled",
    body: "Nothing was charged.",
  },
  paymentsUnavailable: {
    title: "Payments Unavailable",
    body: "Payments aren’t available right now. Try again later.",
  },
  takingTooLong: {
    title: "Taking Too Long",
    body: "Try again.",
  },
  sessionEnded: {
    title: "Verification timed out",
    body: "Hold your item here again to verify.",
  },
  accessoryNotReady: {
    title: "Accessory Isn’t Ready",
    body: "Ask them to lock this accessory, then try again.",
  },
  cantLock: {
    title: "Can’t Lock",
    body: "This accessory can’t be locked.",
  },
  wrongOwnerWallet: {
    title: "Wrong Wallet",
    body: "Connect the wallet that owns this accessory.",
  },
  ownAccessory: {
    title: "That’s Your Accessory",
    body: "You can’t collect a payment from your own accessory.",
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
  connectToContinue: {
    title: copy.common.connectWalletTitle,
    body: "Connect your wallet to continue.",
  },
  itemNotFound: {
    title: "Item not found",
    body: "Hold your item here again to verify.",
  },
  tokenNotSupported: {
    title: "Token Not Supported",
    body: "This token isn’t supported. Switch to USDC.",
  },
  tokenUnavailable: {
    title: "Token Unavailable",
    body: "Switch to USDC and try again.",
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
    title: "Payment not completed",
    body: "Something went wrong. Try again.",
  },
} as const;
