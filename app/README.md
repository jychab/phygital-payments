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

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_PRIVY_APP_ID` | Yes | Privy app ID from the [Privy Dashboard](https://dashboard.privy.io) |
| `NEXT_PUBLIC_SOLANA_CLUSTER` | No | `devnet` (default) or `mainnet` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | No | Solana RPC HTTP URL |

Configure the Privy app for Solana external wallet connectors. Login method: wallet connect only.

## Modes

### Home (`/`)

Connect a wallet via Privy, then use tabs:

- **Pay** — **Pay $X** opens a spending window, then **Hold to Pay** at the merchant. Requires a spending limit and at least one NFC device. If Pay isn't configured, the tab offers **Enable Pay** (wallet sign + Face ID seal on this phone).
- **Devices** — list of NFC devices for this wallet. Add a device by holding a tag (opens `/device`).
- **Activity** — recent payments for the connected wallet.

Pay settings (spending limits, token management) live on Home. The Pay key is sealed with **Face ID** (WebAuthn PRF) on this phone after Enable Pay.

Legacy collect query params on `/` (`?recipient=` / `?amount=`) redirect to `/collect`.

### Collect (`/collect`)

Destination flow — **no Privy / Connect**. The settle-to wallet **must** come from `?recipient=`:

- Enter an amount, then hold NFC. Must run in Safari/Chrome (not a wallet in-app browser).
- If the wallet has no USDC receive account yet, Collect shows an error with a link to **`/setup`**.
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

After an NFC tap. `/device` has **no Privy / Connect**. Wallet linking is a **successful end state**; Pay setup is **optional**.

**Step 1 — Safari or Chrome (`/device`):**

1. Verify tap (silent)
2. **Unclaimed / unlocked** — WebAuthn tap, then link wallet on `/device/finish`
3. **Locked and owned** — **Your wallet is ready.** Status: Wallet, Pay (On/Off), Spending Limit
   - **Set Up Pay** / **Not Now** when Pay is off
   - **Pay $X** → Face ID → **Hold to Pay** when Pay is on and this phone has a sealed key

**Step 2 — finish (`/device/finish`):** Privy wallet connect.

- `?token=` — claim device, then **Your wallet is ready.** (optional Set Up Pay; no forced wizard)
- `?intent=limit&owner=` — set spending limit
- `?intent=verifier&owner=` — **Enable Pay** (sign + Face ID seal)

Pay keys are encrypted with WebAuthn PRF (platform Face ID). **Manage Pay → Add to Shortcuts** copies an open URL after Face ID unlock.

### Open a spending window (API key)

After Enable Pay, use **Manage Pay → Add to Shortcuts** (Face ID unlock). Any client can open a ~45s grant without NFC:

```
GET /api/preauth/open?apiKey=<ppk_…>&amountUi=100
```

Query params:

| Param | Required | Description |
|-------|----------|-------------|
| `apiKey` | Yes | Device pay key (`ppk_…`) |
| `amountUi` | One of | Human amount, e.g. `100` |
| `amount` | One of | Raw u64 decimal (smallest units) |
| `mint` | No | Token mint (defaults to USDC) |

Provide **exactly one** of `amountUi` or `amount`. Response: `{ grantId, expiresAt, wallet, maxAmount, mint }`. Responses use `Cache-Control: no-store`.

A **200 from `/open` only means the spending window is open** — not that payment completed. Settlement happens when you hold NFC to the merchant Collect phone; the merchant UI is the receipt. In-app Pay and Shortcuts both stop after opening the window (countdown / toast only). They do **not** poll for `paid`.

Cancel an open window: `DELETE /api/preauth` with `Authorization: Bearer <apiKey>`.

Keys in query strings may appear in CDN/proxy logs — use **Rotate API Key** in Manage Pay if leaked, and update saved Shortcut URLs.

```bash
curl "https://<host>/api/preauth/open?apiKey=ppk_…&amountUi=100"
```

#### Set up iOS Shortcuts

1. Enable Pay on Home or `/device/finish`, then **Manage Pay → Add to Shortcuts** (Face ID).
2. Shortcuts → New Shortcut → **Get Contents of URL**.
3. Method **GET**. URL:

   `https://<host>/api/preauth/open?apiKey=<pasted ppk_…>&amountUi=100`

   Optional: use Ask Each Time / Text actions to change `amountUi`, and add `&mint=` for a non-USDC token.
4. Optional: **Show Notification** when the GET succeeds — **window opened** (e.g. “Hold to Pay”), not that you were charged.
5. Run the Shortcut → within ~45 seconds hold your NFC device to the merchant Collect phone.
6. After **Rotate API Key**, update the Shortcut URL.

#### Set up Android (Tasker or similar)

Android has no single first-party Shortcuts equivalent; use an HTTP automation app (e.g. **Tasker**):

1. Enable Pay, then **Manage Pay → Add to Shortcuts** (Face ID) to copy the open URL.
2. New task → **HTTP Request** (or Net → HTTP Get).
3. Method **GET**, URL:

   `https://<host>/api/preauth/open?apiKey=<pasted ppk_…>&amountUi=100`
4. Optional: toast when the GET succeeds (**window opened**, not payment settled).
5. Run the task → within ~45 seconds hold NFC to the merchant Collect phone.
6. After rotating the key, update `apiKey` in the saved URL.

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
