# Revibase

Next.js app for Revibase products: **Collection** (cards & accessories), **Pay**
(NFC tap-to-pay), and **Collect** (merchant receive). Runs standalone with Privy
for login and Solana wallets.

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

## Brand

| Layer | Name | Where |
|-------|------|--------|
| Company | **Revibase** | Wordmark on `/` only |
| Product | **Collection** | Owner hub (`/`) — cards + accessories |
| Product | **Pay** | Accessory task journey (NFC tap-to-pay) |
| Product | **Collect** | Merchant receive (`/collect`) |
| Object | **Card** / **Accessory** | Task chrome on `/card`, `/accessory` |

Document titles use Next’s `%s — Revibase` template. Do not brand every route as “Revibase Pay.”

## Code map

Routes live in `src/app`. Each has a top-level `*App` component. Domain code
(`components/`, `hooks/`, `lib/`) uses the same folder names.

| Route | Component | Folder |
|-------|-----------|--------|
| `/` | `HomeApp` → `CollectionHome` | `home/` |
| `/collect` | `CollectApp` | `collect/` |
| `/accessory` | `AccessoryApp` | `accessory/` |
| `/card` | `CardApp` | `card/` |

Shared surfaces (used by multiple routes):

- `components/phygital/` — NFC app, by-address loader, `PhygitalRouteShell`
- `components/claim/` — `ClaimPanel` + `FinishClaimPanel` (card and accessory)
- `components/pay/` — Pay setup / Hold to Pay

Owned-accessory home after a check or claim is `AccessoryHome` (`accessory/accessory-home.tsx`).
One `PrivyProvider` lives in `PrivyWalletRoot` (root layout). Home, claim
finish, and Collect ATA setup ask for it via `PrivyGate`. Collect itself and
Collect embeds do not load the Privy SDK until ATA create. Do not wrap
`PrivyWalletProvider` again on a route.
The connected wallet is always passed as `owner` (not `recipient` / `expectedOwner`). Collect’s settle-to address is always `?recipient=` from the URL.

Shared Pay UI is `PayScreen` in `components/pay/`:

- `pay-screen.tsx` — orchestrator (spending limit → Pay home)
- `hold-to-pay-panel.tsx` — ready to tap, or Press Pay when Confirm Payments is on
- `spending-limit-panel.tsx` — per-accessory token allowance
- `manage-pay-panel.tsx` — spending limits + Confirm Payments
- `api-key-panel.tsx` — paste / issue / rotate (only after confirmation is on)

## Modes

### Home (`/`)

Owner **Collection** hub — connect a wallet via Privy to see your collection:

- **Cards** — minted phygital tokens in a two-column grid with DAS artwork. Tap opens `/card?address=…&from=collection` (same card home + Back to Collection + verified seed).
- **Accessories** — unminted NFC accessories listed below; tap opens `/accessory?address=…&from=collection` (same accessory home + Pay CTAs when eligible).
- No Activity or Collect on `/` — Collect is `/collect`; Pay lives on the `/accessory` task journey.

### Collect (`/collect`)

Isolated merchant receive flow. Entry via `/collect?recipient=` or embed only — not linked from Home or accessory surfaces.

**Recipient always comes from `?recipient=`** in the URL. Privy is not loaded for Collect unless the recipient needs an Associated Token Account created (standalone only).

- Static **Collect** header + display-only destination chip (URL recipient).
- Enter an amount, then hold NFC. Must run in Safari/Chrome (not a wallet in-app browser).
- If the recipient has no receive account for the selected token yet, standalone Collect loads Privy in place to **Connect wallet** (must match recipient) and create the ATA.
- Embeds stay sealed — no wallet setup; show a finish-setup message instead.
- Success holds until you tap **Done** (no auto-reset).
- Missing or invalid `?recipient=` shows an error gate.

### Accessory (`/accessory`)

Accessory **task journey** — authenticity, claim, Pay, and manage. Only phygital tokens **without** a linked mint stay here; minted tokens redirect to `/card`.

Cold entry (`/accessory` NFC or bookmark) shows **Hold to Check**. Signed NFC URLs verify silently, then show **Registered** (on-chain). Optional **Hold to Check** upgrades to **Confirmed**. Privy loads for Pay, claim finish (`?token=`), or wallet-connected overflow actions.

1. **Hold to Check** (no URL) or silent URL verify → **Registered**
2. **Unclaimed / unlocked** — **Add to Wallet** (WebAuthn tap, then `?token=` to connect and confirm)
3. **Locked and payment-capable** — **Pay** via primary CTA; Pay settings, Activity, lock/remove via header **⋯** menu (task mode only)

Collection open (`/accessory?address=&from=collection`) uses the same authenticity + Pay home, with Back to Collection and a verified-owned Confirmed seed.

### Card (`/card`)

Phygital tokens **with** a linked mint. Shows DAS mint metadata (name, image, collection). Authenticate with **Hold to Check**. Optionally **Add to Wallet**. No Pay or Collect.

A signed NFC URL or Hold to Check that resolves a minted token redirects from `/accessory` to `/card` (query string preserved). The reverse happens for tokens with no mint.

API keys live in browser localStorage, keyed by wallet, and are only needed when Confirm Payments is on. **Manage API key** imports, generates, or rotates a key. Setting a spending limit requires a balance for that token in the linked wallet.

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

The API key is stored in plaintext in localStorage in this browser. Use **Rotate API key** under **Manage API key** if leaked. `/api/preauth/open` only gates Revi-sponsored settlement when Confirm Payments is on for that wallet.

```bash
curl -H "x-api-key: ppk_…" "https://<host>/api/preauth/open"
curl --max-time 150 -H "x-api-key: ppk_…" "https://<host>/api/preauth/status?grantId=…"
```

### Payment link (`/collect?recipient=<solana-address>`)

Collect opens from a payment link. Settles to `?recipient=` only (wallet connect does not change the destination). The header shows a sealed destination chip. Optional `?amount=` prefills (and locks) the amount. Optional `?mint=` selects a Jupiter-verified classic SPL mint (defaults to USDC). Without a valid `?recipient=`, Collect shows an error. If the recipient has no receive account yet, standalone Collect offers **Connect wallet** on the same page to create the ATA (wallet must match the recipient).

### iframe embed

Merchant sites may embed the Collect route as an iframe. CSP allows `frame-ancestors *`.

Requirements when embedded:

- `?recipient=<solana-address>` is **required** (invalid/missing → error screen)
- Optional `?amount=`
- Wallet connect / disconnect is disabled
- Only the payment-link receive UI is shown (`/accessory` is blocked in iframes)

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
