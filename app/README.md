# Phygital Payments

Next.js app for LazorKit passkey wallets, NFC phygital accessories, and on-chain claims.

External apps (tap-to-pay + NFC sign-in): see the [root README](../README.md).

## Setup

From the repo root:

```bash
pnpm install
cp app/.dev.vars.example app/.dev.vars
cp workers/api/.dev.vars.example workers/api/.dev.vars
cp workers/signer/.dev.vars.example workers/signer/.dev.vars
# fill secrets in workers/api and workers/signer (see below)
pnpm --filter app db:migrate:local
pnpm --filter app db:migrate:signer:local
# First-time fee payer:
#   pnpm --filter @phygital/signer-worker provision-fee-payer
pnpm --filter app dev
```

`pnpm --filter app dev` starts **three processes**:

1. **Signer worker** — `workers/signer` on port **8788**
2. **API worker** — `workers/api` on port **8787**
3. **Next.js** — UI on port **3000**

The browser calls the API at **`NEXT_PUBLIC_API_ORIGIN`** (local default `http://localhost:8787`). There is no Next `/api` proxy.

For **full worker parity** (OpenNext bundle, no Next dev server):

```bash
pnpm --filter app dev:workers
```

Run packages alone: `dev:signer`, `dev:api`, `dev:next`.

### Environment

Each package has its own `.dev.vars` (gitignored). Copy from the matching `.dev.vars.example`. Only required values are listed.

#### App (`app/.dev.vars`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_ORIGIN` | Yes | API worker origin (`http://localhost:8787` locally, `https://api.revibase.com` in prod) |
| `NEXT_PUBLIC_SOLANA_CLUSTER` | No | `devnet` (default) or `mainnet` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | No | Solana RPC HTTP URL |

Production pages worker sets these via `app/wrangler.jsonc` `vars`.

#### API worker (`workers/api/.dev.vars`)

| Variable | Required | Description |
|----------|----------|-------------|
| `WALLET_SESSION_SECRET` | Yes | Wallet session JWT HMAC |
| `SIGNER_INTERNAL_TOKEN` | Yes | Bearer token for API → signer |
| `SIGNER_ORIGIN` | Dev | HTTP signer URL when the `SIGNER` binding is unused (`http://127.0.0.1:8788`) |
| `APP_ORIGIN` | Yes | Comma-separated browser origins for credentialed CORS |

Solana RPC/cluster are set in `workers/api/wrangler.jsonc` `vars`.

#### Signer worker (`workers/signer/.dev.vars`)

| Variable | Required | Description |
|----------|----------|-------------|
| `APP_ENCRYPTION_SECRET` | Yes | HKDF material for sealed keys in signer D1 |
| `SIGNER_INTERNAL_TOKEN` | Yes | Same token the API uses |
| `FEE_PAYER_SECRET_KEY` | No | One-time import for `provision-fee-payer` only |

Deploy order: `pnpm --filter app deploy` (signer → API → pages).

Passkeys are bound to the page hostname (`rpId`). Localhost and production are different wallets.

## Code map

Routes live in `src/app`. Domain code (`components/`, `hooks/`, `lib/`) uses the same folder names.

| Route | Component | Folder |
|-------|-----------|--------|
| `/` | `WalletApp` (passkey-gated) | `wallet/` |
| `/card` | `CardApp` (public, minted) | `card/` |

## Wallet (`/`)

Passkey-gated LazorKit smart wallet: send/receive SOL, holdings, agent sessions, and NFC phygital flows.

A signed NFC URL (`/?pk=&s=&c=&n=`) verifies silently after sign-in.

1. **Sign in** with a passkey (creates a LazorKit wallet if needed)
2. **Tap** (signed URL) → load the on-chain token via the API worker
3. **Controlled + unclaimed** — claim to this vault, then allow other apps via agent sessions
4. **Controlled + claimed by someone else** — show that owner address
5. **Controlled + claimed by this vault** — full wallet UI

Bearer tokens are not this route. Locked accessories cannot be claimed from this app.

## Card (`/card`)

Public — no passkey required to check. Live **Hold to Check** (WebAuthn) or a signed NFC URL, then collectible metadata when a mint is attached. NFC URLs can point here directly (`/card?pk=&s=&c=&n=`).
