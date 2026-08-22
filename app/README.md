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
| `/` | `AccessoryApp` (passkey-gated) | `accessory/` |
| `/card` | `CardApp` (public, minted) | `card/` |

## Accessory (`/`)

Passkey-gated. Restore a LazorKit session or create one with Face ID. Default accessories have no mint — this route does not look one up.

A signed NFC URL (`/?pk=&s=&c=&n=`) verifies silently after sign-in. Live Hold to Check is not used here — the tap signature is enough.

1. **Sign in** with a passkey (creates a LazorKit wallet if needed)
2. **Tap** (signed URL) → load the on-chain token
3. **Controlled + unclaimed** — **Add to Wallet** (NFC tap, then confirm with Face ID)
4. **Controlled + claimed by someone else** — show that owner address
5. **Controlled + claimed by this vault** — LazorKit wallet UI (placeholder)

Bearer tokens are not this route. Locked accessories cannot be claimed from this app.

## Card (`/card`)

Public — no passkey required to check. Live **Hold to Check** (WebAuthn) or a signed NFC URL, then the same claim flow for accessories that have a mint attached. After verify, DAS metadata is loaded and collectible art is shown when it exists. NFC URLs can point here directly (`/card?pk=&s=&c=&n=`). After a URL tap, optional **Hold to Check** upgrades the subtitle to **Confirmed just now.**
