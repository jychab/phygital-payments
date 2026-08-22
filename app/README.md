# Phygital Pay

Next.js app for enabling tap-to-pay on a phygital NFC accessory and receiving tap-authorized transfers. Users create a platform passkey; a LazorKit smart wallet (vault PDA) is the on-chain owner.

## Setup

From the repo root:

```bash
pnpm install
cp app/.dev.vars.example app/.dev.vars
# set NEXT_PUBLIC_SOLANA_RPC_URL (optional; defaults to public Solana RPC)
# set NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY / FEE_PAYER_SECRET_KEY (required to create wallets and sponsor txs)
pnpm --filter app dev
```

Or from this directory:

```bash
pnpm install
pnpm dev
```

### Environment

Local config lives in **`.dev.vars`** only (not `.env` / `.env.local`). `next.config.ts` copies it into `process.env` so Next and Wrangler share the same file. Production still uses Cloudflare `vars` / secrets + `wrangler.jsonc`.

Read **string vars/secrets** from `process.env`. Use `getCloudflareContext().env` only for Cloudflare **bindings** (KV, D1, Durable Objects).

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SOLANA_CLUSTER` | No | `devnet` (default) or `mainnet` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | No | Solana RPC HTTP URL |
| `NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY` | Yes | Fee-payer that sponsors LazorKit createWallet / Execute and ATA create |
| `FEE_PAYER_SECRET_KEY` | Yes | Matching secret (Wrangler / worker) |

Passkeys are bound to the page hostname (`rpId`). Localhost and production are different wallets.

## Code map

Routes live in `src/app`. Each has a top-level `*App` component. Domain code
(`components/`, `hooks/`, `lib/`) uses the same folder names.

| Route | Component | Folder |
|-------|-----------|--------|
| `/` | `HomeApp` | `home/` |
| `/collect` | `CollectApp` | `collect/` |
| `/accessory` | `AccessoryApp` | `accessory/` |

Shared Pay UI (Home tab and owned accessory) is `PayScreen` in `components/pay/`:

- `pay-screen.tsx` — orchestrator (spending limit → Pay home)
- `hold-to-pay-panel.tsx` — ready to tap, or Press Pay when Confirm Payments is on
- `spending-limit-panel.tsx` — per-accessory token allowance
- `manage-pay-panel.tsx` — spending limits + Confirm Payments
- `api-key-panel.tsx` — paste / issue / rotate (only after confirmation is on)

Owned-accessory home after a check or claim is `AccessoryHome` (`accessory/accessory-home.tsx`).
The connected address is the LazorKit **vault PDA** (`token.owner`), from `useSmartWallet` / `useSolanaAddress`. Collect embeds never load the passkey session. Collect’s settle-to address stays `recipient`.

## Modes

### Home (`/`)

Create a passkey, then use tabs:

- **Pay** — After a spending limit: confirmation off (default) opens **Pay Settings**; confirmation on opens Hold to Pay (**Pay**, then tap). Requires a spending limit and at least one NFC accessory.
- **Accessories** — list of NFC accessories for this vault. Hold an accessory on `/accessory` to check it, then claim it to this wallet if you want.
- **Activity** — recent payments for the connected wallet.

Pay settings (spending limits, Confirm Payments) are the Pay tab when confirmation is off, and **Pay Settings** from Hold to Pay when it is on. Turning confirmation on uses Face ID (WebAuthn) and may issue an API key stored in **localStorage** on this phone. **Use on Another Phone** (copy/paste/rotate) appears only while confirmation is on.

### Collect (`/collect`)

Destination flow. The settle-to wallet comes from the **connected vault** or `?recipient=`. When both exist, they stay in sync (session wallet is the source of truth; the URL is updated to match).

- Header shows the same wallet chip as Home. Create a passkey on `/collect` with no `?recipient=` to start collecting to that vault.
- Enter an amount, then hold NFC. Must run in Safari/Chrome (not a wallet in-app browser).
- If the wallet has no receive account for the selected token yet, Collect offers **Set up receiving** (fee-payer creates the ATA).
- Missing or invalid `?recipient=` with no connected wallet prompts to create a passkey (or shows an error in embeds).
- Connected Collect shows the Home/Collect dropdown. Embeds stay sealed (static Collect label, display-only destination chip, no dropdown).

Activity lives on Home, not Collect.

### Accessory (`/accessory`)

Authenticity first. Claim and Pay are optional.

`/accessory` with no tap params shows **Hold to Check** (live WebAuthn in the browser). A signed NFC URL (`/accessory?pk=&s=&c=&n=`) verifies silently, then shows **Verified**. Optional **Hold to Check** upgrades the subtitle to **Confirmed just now.**

1. **Hold to Check** (no URL) or silent URL verify → **Verified**
2. **Unclaimed / unlocked** — optional **Claim** (NFC tap, then `/accessory?token=` to create a passkey and confirm with Face ID)
3. **Locked and payment-capable** — **Collect** and **Pay** (same Pay tab as Home). Face ID is used when signing a limit or turning on Confirm Payments.

API keys live in localStorage on this phone, keyed by vault address, and are only needed when Confirm Payments is on. **Use on Another Phone** copies, pastes, or issues/rotates a key. Setting a spending limit requires a balance for that token in the vault.

### Open a spending window (API key)

In-app Pay calls `GET /api/preauth/open` with the stored API key **when Confirm Payments is on**. Integrators can do the same. Settlement does **not** require an open window unless that setting is on for the payer wallet.

```
GET /api/preauth/open
x-api-key: <ppk_…>
```

Headers:

| Header | Required | Description |
|--------|----------|-------------|
| `x-api-key` | Yes | HMAC API key (`ppk_<wallet>_<gen>_<hmac>`) |

Response: `{ grantId, expiresAt, wallet }` (grant stored in a per-wallet Durable Object). Responses use `Cache-Control: no-store`. Opening a new window **immediately cancels** any previous unpaid grant for that wallet.

A **200 from `/open` only means the spending window is open** — not that payment completed. Settlement happens when you hold NFC to the merchant Collect phone. In-app Pay then waits on `GET /api/preauth/status` (one request, no polling) and shows cancelled, expired, or paid (recipient and amount). Mint and amount are chosen by Collect and capped on-chain by the payer's spending limit for that token.

Wait for the result of that window (one request, no polling):

```
GET /api/preauth/status?grantId=<uuid>
x-api-key: <ppk_…>
```

The response is held until a terminal status:

| `status` | Meaning |
|----------|---------|
| `cancelled` | Caller cancelled (`DELETE /api/preauth`) or a newer `/open` replaced this grant |
| `expired` | Window TTL elapsed with no webhook |
| `success` | Helius webhook indexed the transfer — includes `recipient`, `amount` (raw u64), `mint`, `signature` |

Keep the HTTP connection open for the full window. Example: `curl --max-time 150 -H "x-api-key: ppk_…" "https://<host>/api/preauth/status?grantId=…"`.

Cancel an open window: `DELETE /api/preauth` with `Authorization: Bearer <apiKey>` (rejects rotated keys).

The API key is stored in plaintext in localStorage on this phone. Use **Start over** in **Use on Another Phone** if leaked. `/api/preauth/open` only gates Revi-sponsored settlement when Confirm Payments is on for that wallet.

```bash
curl -H "x-api-key: ppk_…" "https://<host>/api/preauth/open"
curl --max-time 150 -H "x-api-key: ppk_…" "https://<host>/api/preauth/status?grantId=…"
```

### Payment link (`/collect?recipient=<solana-address>`)

Collect can also open from a payment link. Settles to `?recipient=` until a passkey session exists; connecting syncs the URL to that vault. The header shows a wallet chip (embeds show a sealed destination chip). Optional `?amount=` prefills (and locks) the amount. Optional `?mint=` selects a Jupiter-verified classic SPL mint (defaults to USDC). Without a valid `?recipient=` or connected wallet, Collect prompts to create a passkey. If the recipient has no receive account yet, Collect offers **Set up receiving**.

### iframe embed

Merchant sites may embed the Collect route as an iframe. CSP allows `frame-ancestors *`.

Requirements when embedded:

- `?recipient=<solana-address>` is **required** (invalid/missing → error screen)
- Optional `?amount=`
- Passkey connect / disconnect is disabled
- Only the payment-link receive UI is shown (`/accessory` is blocked in iframes)
- Missing ATAs can still be created (fee-payer sponsored)

Example:

```html
<iframe
  src="https://your-pay-host/collect?recipient=<SOLANA_ADDRESS>&amount=12.50"
  title="Pay"
  style="width:100%;height:640px;border:0"
  allow="publickey-credentials-get *"
></iframe>
```

`allow="publickey-credentials-get *"` is needed so NFC / WebAuthn taps work inside the frame.
