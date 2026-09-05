# Revibase co-signer

**POST `/preview`** + **POST `/sign`** for phygital-wallet `execute` co-signing.

Instruction standing policy is built with **`phygital-verifier-sdk`**
(`defineStandardPolicy`, `createVerifier`). This folder owns the Worker HTTP
routes, fee gate, and Revibase approval/grants in D1.

Parent Worker layout: [`../../README.md`](../../README.md).

## Files

| File | Role |
|------|------|
| [`preview.ts`](./preview.ts) | Preflight intent (no signature) |
| [`sign.ts`](./sign.ts) | Decode wire tx → authorize → co-sign |
| [`approval/`](./approval/) | Standing policies + one-time grants |
| [`decode-tx.ts`](./decode-tx.ts) | Base64 wire → execute accounts + body ixs |
| [`cosign.ts`](./cosign.ts) | Sign message bytes with `VERIFIER_SECRET_KEY` |

Also: `assert-preview-wallet.ts`, `intent-hash.ts`, `errors.ts`, `constants.ts`.

PDA derivation and execute codecs come from **`phygital-wallet-sdk`**.

## Flow

```
Client
  │  POST /preview  { phygitalToken, instructions }
  │    → wallet PDA must be a signer
  │    → authorizeIntent({ mode: "preview" })
  │    → assertFeeBalance only if authorize ok (skip RPC on deny)
  │
  │  NFC / passkey → wrap execute
  │  POST /sign  { transactions: [base64…] }
  │    → decodeWireTransaction
  │    → assertFeeBalance (before authorize — preserve grants on fee fail)
  │    → authorizeIntent({ mode: "sign" })
  │    → assert verifier key + sign message bytes
  └─► { signatures: [base64…] }
```

Fee balance is debited asynchronously via `POST /webhooks/helius` after
confirmed execute — not on `/sign`.

## Env

- `VERIFIER_SECRET_KEY` — 32-byte seed or 64-byte Solana keypair (base58 or JSON bytes)
- D1 for `approval/` policies and grants
