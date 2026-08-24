# Revibase — NFC accessory for external apps

An NFC accessory is a physical passkey. After the owner claims it in the [Revibase wallet](https://revibase.com) and turns on tap to pay, other apps can:

1. **Sign the user in** — prove they hold this chip (`phygital-token-sdk`)
2. **Request a transaction** — have the chip authorize a spend from their wallet

Both require a **live tap**. A scanned URL is not enough.

Production API: `https://api.revibase.com`  
(Local: `http://localhost:8787` — see [`app/README.md`](app/README.md).)

---

## What the owner must do first

In the Revibase wallet, the owner:

1. Claims the accessory to their passkey wallet
2. Turns on **tap to pay** (this locks the chip and creates a spending session)

Until that grant exists, signing fails with *Other apps can’t use this accessory*.

Default session (the owner can tighten this):

| Cap | Default |
|-----|---------|
| SOL per tap | 0.5 |
| SOL per day | 2 |
| USDC per tap | 100 |
| USDC per day | 1,000 |
| Allowed programs | SPL Token, Associated Token, Jupiter v6, Compute Budget |

---

## Sign in (authentication)

Use [`phygital-token-sdk`](https://www.npmjs.com/package/phygital-token-sdk). This path never talks to the Revibase API and never submits a transaction.

```ts
import {
  startAuthentication,
  verifyResponse,
  parseSecp256r1Pubkey,
  findTokenPda,
  fetchMaybePhygitalToken,
} from "phygital-token-sdk";

const challenge = crypto.randomUUID();
const response = await startAuthentication(challenge);

const { isVerified, secp256r1PublicKey } = verifyResponse({
  expectedMessage: challenge,
  response,
});

if (!isVerified) throw new Error("Tap failed");

// Identity: compressed secp256r1 key (also WebAuthn response.id).
// Token PDA is seeded by this key — not the chip identifier.
const tokenPda = await findTokenPda(parseSecp256r1Pubkey(secp256r1PublicKey));
const token = await fetchMaybePhygitalToken(rpc, tokenPda);
// token.data.owner = LazorKit vault that spends when they tap to pay
```

Native / kiosk readers: pass a `transceive` function as the second argument to `startAuthentication`.

Use a fresh challenge per tap. Do not reuse a payment challenge (`GET /api/challenge`) as a login challenge, or the reverse.

Need an **on-chain** possession proof for your program? Use the SDK composable verify flow (`beginVerify` → `completeVerify`) instead of `verifyResponse`. That still does not move funds.

---

## Request a transaction (tap to pay)

The accessory signs through Revibase. Get a challenge, tap, then pass a Kit `TransactionModifyingSigner` from [`lazor-kit`](clients/js/lazor_kit) as the fee payer. The signer wraps your inner instructions in a LazorKit session execute, sponsors the fee, and returns a signed transaction.

```
GET /api/challenge
        ↓
startAuthentication(challenge)
        ↓
createTransactionModifyingSigner(response, requestId, vault)
        ↓
Build a Kit tx: SOL transfer from the vault, signer as fee payer
        ↓
sign / send as usual — the signer talks to /api/modifyAndSign for you
```

`/api/challenge` is public (`Access-Control-Allow-Origin: *`). Challenges expire after **2 minutes** and are one-tap.

### 1. Challenge

```ts
const { requestId, challenge, expiresAtMs } = await fetch(
  "https://api.revibase.com/api/challenge",
).then((r) => r.json());
```

| Field | Meaning |
|-------|---------|
| `requestId` | Pass to `createTransactionModifyingSigner` |
| `challenge` | Pass to `startAuthentication` |
| `expiresAtMs` | Unix ms; challenge is one-tap and expires after 2 minutes |

### 2. Tap and signer

```ts
import {
  startAuthentication,
  parseSecp256r1Pubkey,
  findTokenPda,
  fetchMaybePhygitalToken,
} from "phygital-token-sdk";
import { createTransactionModifyingSigner } from "lazor-kit";

const response = await startAuthentication(challenge);

const tokenPda = await findTokenPda(parseSecp256r1Pubkey(response.id));
const token = await fetchMaybePhygitalToken(rpc, tokenPda);
const vault = token.data.owner;

const signer = createTransactionModifyingSigner(response, requestId, vault);
```

Override `modifyAndSignUrl` for local (`http://localhost:8787/api/modifyAndSign`). The default is `https://api.revibase.com/api/modifyAndSign`.

### 3. Check session capabilities (optional)

Before you build a payment, read the on-chain LazorKit session. That tells you whether tap to pay is on, whether it has expired, and what the session is allowed to spend.

The accessory token’s `owner` is the **vault**. Sessions belong to the LazorKit **wallet PDA** (`session.wallet`). `findVaultPda(wallet)` must equal that vault.

```ts
import {
  decodeSessionAccount,
  findVaultPda,
  SessionActionType,
  SYSTEM_PROGRAM_ADDRESS,
} from "lazor-kit";

const vault = token.data.owner;
const { value: account } = await rpc.getAccountInfo(sessionPda).send();
if (!account) throw new Error("Tap to pay is off");

const session = decodeSessionAccount(account.data);
if ((await findVaultPda(session.wallet)) !== vault) {
  throw new Error("Session is not for this accessory");
}

const { value: slot } = await rpc.getSlot().send();
if (session.expiresAt <= BigInt(slot)) throw new Error("Session expired");

for (const action of session.actions) {
  if (action.type === SessionActionType.SolMaxPerTx && lamports > action.max) {
    throw new Error("Over per-tap SOL cap");
  }
}

const allowlist = session.actions.filter(
  (action) => action.type === SessionActionType.ProgramWhitelist,
);
if (
  allowlist.length > 0 &&
  !allowlist.some((action) => action.programId === SYSTEM_PROGRAM_ADDRESS)
) {
  throw new Error("SOL transfers are not allowed");
}
```

If you have the wallet PDA, list its sessions with `getProgramAccounts` on the LazorKit program, `memcmp` offset `8` (the wallet field). If you only have the vault, decode candidate session accounts and keep those where `findVaultPda(session.wallet) === vault`. No session, or an expired one, means the owner has not turned on tap to pay.

`session.actions` is the live policy: per-tx / daily SOL and USDC caps, remaining limits, and program allow/deny lists. Recurring actions include `spent` so you can compute what is left in the current window.

### 4. Build and send (SOL transfer)

Transfer 0.01 SOL from the vault. Pass the modifying signer as both the transfer source and the Kit fee payer. Do **not** wrap LazorKit `Execute` yourself — the signer does that.

```ts
import {
  address,
  appendTransactionMessageInstructions,
  createTransactionMessage,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";

const destination = address("RECIPIENT_PUBKEY");
const transfer = getTransferSolInstruction({
  source: signer,
  destination,
  amount: 10_000_000n, // 0.01 SOL
});

const message = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(signer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(lifetime, tx),
  (tx) => appendTransactionMessageInstructions([transfer], tx),
);

const signed = await signTransactionMessageWithSigners(message);
// send `signed` with your usual RPC helper
```

On-chain session policy still applies. Amounts over the per-tap / daily cap, or instructions to a program that is not whitelisted, fail at execution even if signing succeeded.

### Typical errors

| Status | Meaning |
|--------|---------|
| 410 | Challenge expired or already used — mint a new one and tap again |
| 400 | Bad tap, malformed tx, or tx not for this wallet |
| 403 | Unclaimed, tap to pay off, or accessory not locked to this vault |

---

This repo also contains the wallet UI and workers. Local setup: [`app/README.md`](app/README.md). API internals: [`workers/api/README.md`](workers/api/README.md).
