# Verifier template

Minimal **POST `/preview`** + **POST `/sign`** for phygital-wallet `execute`
co-signing. Copy **this folder** when running your own verifier (set the
endpoint on-chain with `set_token_verifier`).

Parent Worker layout (for context): see [`../../README.md`](../../README.md).

## What to read first

| File | What it does |
|------|----------------|
| [`preview.ts`](./preview.ts) | Preflight intent (no signature) |
| [`sign.ts`](./sign.ts) | Decode wire tx → authorize → co-sign |
| [`authorize.ts`](./authorize.ts) | **Swap this** to plug in your approval logic |
| [`decode-tx.ts`](./decode-tx.ts) | Base64 wire → execute accounts + body ixs (`phygital-wallet-sdk` codecs) |
| [`cosign.ts`](./cosign.ts) | Sign message bytes with `VERIFIER_SECRET_KEY` |

PDA derivation and execute codecs come from **`phygital-wallet-sdk`** (Codama) —
do not hand-roll those.

Also: `assert-preview-wallet.ts`, `intent-hash.ts`, `errors.ts`, `constants.ts`.

## Flow

```
Client
  │  POST /preview  { phygitalToken, instructions }
  │    → wallet PDA must be a signer
  │    → authorizeIntent({ mode: "preview" })
  │
  │  NFC / passkey → wrap execute
  │  POST /sign  { transactions: [base64…] }
  │    → decodeWireTransaction
  │    → authorizeIntent({ mode: "sign" })
  │    → assert verifier key + sign message bytes
  └─► { signatures: [base64…] }
```

## Replace approval (important)

[`approval/`](./approval/) is **Revibase-specific**: standing policies in D1 and
one-time “Approve once” grants. Most forks should **not** copy that UX.

1. Implement `authorizeIntent` for your product (allowlist, API key, queue, …).
2. Point [`authorize.ts`](./authorize.ts) at your module (or replace the file).
3. Delete `approval/` if unused.

Keep the `AuthorizeRequest` / `AuthorizeResult` shapes so `preview.ts` /
`sign.ts` stay unchanged.

## Env

- `VERIFIER_SECRET_KEY` — 32-byte seed or 64-byte Solana keypair (base58 or JSON bytes)
- D1 only if you keep `approval/` policies/grants

## Fork checklist

1. Depend on `phygital-wallet-sdk` (+ `@solana/kit`).
2. Copy `api/src/verifier/` into your Worker (swap/delete `approval/`).
3. Mount `verifierRoutes` from `index.ts`.
4. Store your API **base** URL on the token verifier PDA (SDK appends `/preview` and `/sign`).
5. Use the same pubkey as `VERIFIER_SECRET_KEY` in `set_token_verifier`.
