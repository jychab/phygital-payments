# Revibase verifier signer

Private Cloudflare Worker (`revibase-verifier-signer`) that owns:

1. Fee balance gate  
2. `authorizeIntent` (standing policy + Approve-once grants)  
3. Verifier ed25519 co-sign via a pluggable backend  

It is **not** publicly routed. Only [`api`](../api/) calls it through the `VERIFIER_SIGNER` service binding.

This package is **isolated** — it does not import from `api`. Runtime helpers
(policy, fee, decode) are vendored under `src/` and may diverge from the API
Worker copies intentionally.

## RPC (`VerifierSignerEntrypoint`)

| Method | Behavior |
|--------|----------|
| `signTransactions(wires)` | canSign → fee → authorize(`sign`) → `backend.sign` |
| `previewAuthorize({ phygitalToken, instructions })` | wallet PDA signer → authorize(`preview`) → fee if ok (no sign) |

Signing never runs unless fee and policy checks pass.

## Signing backends

| `VERIFIER_SIGNER_BACKEND` | Status |
|---------------------------|--------|
| `secrets` (default) | `VERIFIER_SECRET_KEYS` JSON map pubkey → seed/keypair (max 8) |
| `kms` | Reserved — implement `KmsVerifierBackend` + `VERIFIER_KMS_KEY_MAP` later |

Interface: `src/backend/types.ts` (`canSign` / `sign`).

## Secrets

```bash
# Map of on-chain verifier pubkey → base58 32-byte seed or 64-byte keypair
wrangler secret put VERIFIER_SECRET_KEYS --config wrangler.jsonc
# Example value:
# {"VerifierPubkey111...":"SeedOrKeypairBase58..."}
```

Optional: `TOP_UP_ACCUMULATOR` (same as API) for fee top-up exemption.

## Deploy

Deploy **signer before API** so the service binding target exists:

```bash
pnpm --filter api-signer deploy
pnpm --filter api deploy
```

Local:

```bash
pnpm --filter api dev
# starts both via `wrangler dev -c api -c api-signer`
```
