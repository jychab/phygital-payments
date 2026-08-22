# Accessory

Next.js app to check a phygital NFC accessory and claim it to a LazorKit passkey wallet (vault PDA).

## Setup

From the repo root:

```bash
pnpm install
cp app/.dev.vars.example app/.dev.vars
# set NEXT_PUBLIC_SOLANA_RPC_URL (optional; defaults to public Solana RPC)
# set NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY / FEE_PAYER_SECRET_KEY (required to create wallets and sponsor claim txs)
pnpm --filter app dev
```

Or from this directory:

```bash
pnpm install
pnpm dev
```

### Environment

Local config lives in **`.dev.vars`** only (not `.env` / `.env.local`). `next.config.ts` copies it into `process.env` so Next and Wrangler share the same file. Production still uses Cloudflare `vars` / secrets + `wrangler.jsonc`.

Read **string vars/secrets** from `process.env`. Use `getCloudflareContext().env` only for Cloudflare **bindings** (KV).

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SOLANA_CLUSTER` | No | `devnet` (default) or `mainnet` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | No | Solana RPC HTTP URL |
| `NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY` | Yes | Fee-payer that sponsors LazorKit createWallet / Execute |
| `FEE_PAYER_SECRET_KEY` | Yes | Matching secret (Wrangler / worker) |

Passkeys are bound to the page hostname (`rpId`). Localhost and production are different wallets.

## Code map

Routes live in `src/app`. Domain code (`components/`, `hooks/`, `lib/`) uses the same folder names.

| Route | Component | Folder |
|-------|-----------|--------|
| `/` | redirects to `/accessory` | — |
| `/accessory` | `AccessoryApp` | `accessory/` |

## Accessory (`/accessory`)

Authenticity first. Claim is optional.

`/accessory` with no tap params shows **Hold to Check** (live WebAuthn in the browser). A signed NFC URL (`/accessory?pk=&s=&c=&n=`) verifies silently, then shows **Verified**. Optional **Hold to Check** upgrades the subtitle to **Confirmed just now.**

1. **Hold to Check** (no URL) or silent URL verify → **Verified**
2. **Unclaimed / unlocked** — optional **Add to Wallet** (NFC tap, then create a passkey and confirm with Face ID on the same screen)

Locked accessories cannot be claimed from this app.
