# Standard policies

Helpers that ship a safe-by-default allowlist plus **per-transaction** spend aggregates.

```ts
import {
  defineStandardPolicy,
  standardPolicy,
  standardTransaction,
  uiAmountToRaw,
} from "phygital-verifier-sdk";
```

## One-shot: `defineStandardPolicy(opts?)`

Returns a full `PolicyDocument` (`programs` + `transaction.aggregates`).

```ts
const policy = defineStandardPolicy({
  mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // default mainnet USDC
  maxMintRaw: uiAmountToRaw(50, 6).toString(), // default 50 USDC
  maxSolLamports: "100000000", // default 0.1 SOL
  wallet: userWallet, // required for closeAccount rent return
  // includeCollectibles defaults to true (NFT paths + companion allowAll)
});
```

Compose with extra programs:

```ts
import { definePolicy, defineProgram, standardPolicy, standardTransaction } from "phygital-verifier-sdk";

const policy = definePolicy(
  [
    ...standardPolicy({ wallet }),
    defineProgram(jupiterParser, {
      allows: [{ instruction: "route", when: { /* … */ } }],
    }),
  ],
  standardTransaction(),
);
```

Always pair `standardPolicy()` with `standardTransaction()` (or use `defineStandardPolicy`) so USDC/SOL **aggregates** apply across multiple instructions in one transaction.

## Defaults

| Allowed | Cap / notes |
|---------|-------------|
| ATA `create` + `createIdempotent` | Uncapped (rent outside SOL aggregate) |
| System `transferSol` | ≤ 0.1 SOL **per tx** (aggregate) |
| Token / Token-2022 `transferChecked` for the configured mint | ≤ 50 USDC **per tx** combined across both token programs |
| `closeAccount` | Only if `wallet` is set; destination must equal `wallet` |
| Collectibles (on by default) | See below |

**Off by default:** system `createAccount` / `allocate` / `assign`, SPL `transfer` (no mint check). Pass `includeCollectibles: false` for payments-only.

## Collectibles (`includeCollectibles`, default `true`)

Enables:

| Path | Instruction |
|------|-------------|
| Legacy SPL NFT | Token / Token-2022 `transferChecked` with `amount ≤ 1` |
| pNFT / Metaplex TM | Token Metadata `Transfer` with `transferArgs.amount ≤ 1` |
| cNFT V1 | Bubblegum `transfer` |
| cNFT V2 | Bubblegum `transferV2` |
| MPL Core | `TransferV1` |
| Companions | `auth9…`, `cmtDv…`, `noopb…` as `{ allowAll: true }` |

NFT value is not dollar-capped — enabling this allows draining any allowed NFT.

## Options reference

| Option | Default | Purpose |
|--------|---------|---------|
| `mint` | mainnet USDC | Mint for standing `transferChecked` |
| `maxMintRaw` | `"50000000"` | Per-tx raw cap for that mint |
| `maxSolLamports` | `"100000000"` | Per-tx SOL cap |
| `wallet` | unset | Enables `closeAccount` with destination eq wallet |
| `includeCollectibles` | `true` | NFT transfer paths + companion `allowAll` |
| `includeAta` | `true` | ATA create ixs |
| `includeSystemSetup` | `false` | System createAccount / allocate / assign |
| `includeTokenCloseAccount` | `true` | closeAccount when `wallet` set |
| `includeNftTokenTransfer` | `false` | SPL `transfer` amount ≤ 1 (prefer collectibles + `transferChecked`) |
| `tokenPrograms` | `["token","token2022"]` | Which token program blocks to emit |

## `uiAmountToRaw(ui, decimals)`

Converts a UI amount to raw units as `bigint` without float drift for common decimals. Policy condition values must be **decimal strings**:

```ts
uiAmountToRaw(50, 6).toString(); // "50000000"
```

## What STANDARD does *not* do

- Lifetime / daily spend limits (only **per transaction**)
- Recipient allowlists (product layer, e.g. API `recipientMode`)
- Binding authority/source to a specific wallet pubkey in standing allows
- DEX / swap programs (add via [custom parsers](./custom-parsers.md))
