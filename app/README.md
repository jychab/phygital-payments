# Phygital Pay

Next.js app for enabling tap-to-pay on a phygital NFC device and receiving tap-authorized transfers. Runs standalone with Privy for login and Solana wallets.

## Setup

From the repo root:

```bash
pnpm install
cp app/.dev.vars.example app/.dev.vars
# set NEXT_PUBLIC_PRIVY_APP_ID (required)
# set NEXT_PUBLIC_SOLANA_RPC_URL (optional; defaults to public Solana RPC)
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
| `NEXT_PUBLIC_PRIVY_APP_ID` | Yes | Privy app ID from the [Privy Dashboard](https://dashboard.privy.io) |
| `NEXT_PUBLIC_SOLANA_CLUSTER` | No | `devnet` (default) or `mainnet` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | No | Solana RPC HTTP URL |

Configure the Privy app for Solana external wallet connectors. Login method: wallet connect only.

## Modes

### Home (`/`)

Connect a wallet via Privy, then use tabs:

- **Pay** — **Pay** opens a spending window, then **Hold to Pay** at the merchant. Requires a spending limit and at least one NFC device. If Pay isn't configured, the tab offers **Manage API Keys** (paste a key, or wallet-sign to issue one; the API key is stored in localStorage on this phone).
- **Devices** — list of NFC devices for this wallet. Add a device by holding a tag (opens `/device`).
- **Activity** — recent payments for the connected wallet.

Pay settings (spending limits, token management) live on Home. The API key is stored in **localStorage** on this phone after **Manage API Keys**.

### Collect (`/collect`)

Destination flow — **no Privy / Connect**. The settle-to wallet **must** come from `?recipient=`:

- Enter an amount, then hold NFC. Must run in Safari/Chrome (not a wallet in-app browser).
- If the wallet has no receive account for the selected token yet, Collect shows an error with a link to **`/setup`**.
- Missing or invalid `?recipient=` shows an error.
- Top-level Collect uses the header mode dropdown to return to **Home**. Embeds stay sealed (static Collect label, no dropdown).

Activity lives on Home, not Collect.

### Receive setup (`/setup?recipient=`)

One-time ATA creation (Connect required):

1. Connect the wallet that matches `?recipient=`
2. Create the receive account
3. **Open Collect** opens `/collect?recipient=…` in a new tab

Embeds cannot use `/setup` (error screen).

### Device / claim (`/device?pk=&s=&c=&n=`)

After an NFC tap. NFC verify has **no Privy**. Wallet connect loads only for `?token=` or `?owner=&asset=`. Wallet linking is a **successful end state**; Pay setup is **optional**.

1. Verify tap (silent)
2. **Unclaimed / unlocked** — WebAuthn tap, then replace to `/device?token=` and connect (Google in this tab, or copy the finish link into a wallet in-app browser)
3. **Locked and owned** — **Your wallet is ready.** **Collect** (primary) and **Pay** (opens the same Pay tab as Home: API key, spending limit, Hold to Pay). Connect a wallet only when signing a limit or issuing a key — not to open Pay.

API keys live in localStorage on this phone, keyed by wallet. **Manage API Keys** copies, pastes, or issues/rotates a key. Setting a spending limit requires a balance for that token in the linked wallet.

### Open a spending window (API key)

In-app Pay calls `GET /api/preauth/open` with the stored API key. Integrators can do the same:

```
GET /api/preauth/open?apiKey=<ppk_…>
```

Query params:

| Param | Required | Description |
|-------|----------|-------------|
| `apiKey` | Yes | HMAC API key (`ppk_<wallet>_<gen>_<hmac>`) |

Response: `{ grantId, expiresAt, wallet }` (grant stored in a per-wallet Durable Object). Responses use `Cache-Control: no-store`. Opening a new window **immediately cancels** any previous unpaid grant for that wallet.

A **200 from `/open` only means the spending window is open** — not that payment completed. Settlement happens when you hold NFC to the merchant Collect phone. In-app Pay then waits on `GET /api/preauth/status` (one request, no polling) and shows cancelled, expired, or paid (recipient and amount). Mint and amount are chosen by Collect and capped on-chain by the payer's spending limit for that token.

Wait for the result of that window (one request, no polling):

```
GET /api/preauth/status?apiKey=<ppk_…>&grantId=<uuid>
```

The response is held until a terminal status:

| `status` | Meaning |
|----------|---------|
| `cancelled` | Caller cancelled (`DELETE /api/preauth`) or a newer `/open` replaced this grant |
| `expired` | Window TTL elapsed with no webhook |
| `success` | Helius webhook indexed the transfer — includes `recipient`, `amount` (raw u64), `mint`, `signature` |

Keep the HTTP connection open for the full window. Example: `curl --max-time 150 "https://<host>/api/preauth/status?apiKey=ppk_…&grantId=…"`.

Cancel an open window: `DELETE /api/preauth` with `Authorization: Bearer <apiKey>` (rejects rotated keys).

The API key is stored in plaintext in localStorage on this phone. Keys in query strings may also appear in CDN/proxy logs — use **Rotate API key** in **Manage API Keys** if leaked.

```bash
curl "https://<host>/api/preauth/open?apiKey=ppk_…"
curl --max-time 150 "https://<host>/api/preauth/status?apiKey=ppk_…&grantId=…"
```

### Payment link (`/collect?recipient=<solana-address>`)

This is the only Collect entry point. Settles to the URL recipient. **No Sign in / wallet controls** in the header — sealed destination chip only. Optional `?amount=` prefills (and locks) the amount. Optional `?mint=` selects a Jupiter-verified classic SPL mint (defaults to USDC). Without a valid `?recipient=`, Collect shows an error.

### iframe embed

Merchant sites may embed the Collect route as an iframe. CSP allows `frame-ancestors *`.

Requirements when embedded:

- `?recipient=<solana-address>` is **required** (invalid/missing → error screen)
- Optional `?amount=`
- Wallet connect / disconnect is disabled
- Only the payment-link receive UI is shown (`/device` is blocked in iframes)

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
