# Phygital Pay

Next.js app for enabling tap-to-pay on a phygital NFC device and receiving tap-authorized transfers. Runs standalone with Privy for login and Solana wallets.

## Setup

From the repo root:

```bash
pnpm install
cp app/.env.example app/.env.local
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

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_PRIVY_APP_ID` | Yes | Privy app ID from the [Privy Dashboard](https://dashboard.privy.io) |
| `NEXT_PUBLIC_SOLANA_CLUSTER` | No | `devnet` (default) or `mainnet` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | No | Solana RPC HTTP URL |

Configure the Privy app for Solana (embedded wallets + external connectors). Login methods used by this app: email and wallet.

## Modes

### Owner app (no query params)

Connect a wallet via Privy, then use:

- **Receive** — tap a locked phygital NFC device; funds settle into your connected wallet (sponsored fees).
- **Activity** — recent payments for your connected wallet (shown only when connected).

### Enable Pay (`/enable?pk=&s=&c=&n=`)

Tap-gated setup for the payer NFC device (same NFC proof params as vault). Flow:

1. Verify tap (silent) — chip counter must be **greater than** the last value in the shared `revibase_counter` KV (same store as vault); the same counter may remount briefly, then needs a fresh tap
2. Sign in
3. Add NFC device to this phone if needed (claim when unclaimed or unlocked)
4. Set a spending limit (“Turn on Pay”) — also provisions a device pay key automatically
5. Everyday use (in-app): choose amount → Ready to pay (opens grant) → hold NFC to merchant. No in-app “Paid” poll — same as Shortcuts.

The Pay UI always requires a fresh NFC tap (`pk` / `s` / `c` / `n`). Opening a spending window itself uses the device API key (same GET as Shortcuts).

Locked NFC devices owned by someone else require the current owner to unlock first.

### Open a spending window (API key)

After Enable Pay, Manage Pay can **Copy API key** or **Copy open URL**. Any client can open a ~45s grant without NFC:

```
GET /api/preauth/open?apiKey=<ppk_…>&amountUi=20
```

Query params:

| Param | Required | Description |
|-------|----------|-------------|
| `apiKey` | Yes | Device pay key (`ppk_…`) |
| `amountUi` | One of | Human USDC amount, e.g. `20` |
| `amount` | One of | Raw u64 decimal (smallest units) |
| `mint` | No | Token mint (defaults on server / receive path) |

Provide **exactly one** of `amountUi` or `amount`. Response: `{ grantId, expiresAt, wallet, maxAmount }`. Responses use `Cache-Control: no-store`.

A **200 from `/open` only means the spending window is open** — not that payment completed. Settlement happens when you hold NFC to the merchant Collect phone; the merchant UI is the receipt. In-app Pay and Shortcuts both stop after opening the window (countdown / toast only). They do **not** poll for `paid`.

Cancel an open window: `DELETE /api/preauth` with `Authorization: Bearer <apiKey>`.

Keys in query strings may appear in CDN/proxy logs — use **Rotate API key** in Manage Pay if leaked, and update saved Shortcut URLs.

```bash
curl "https://<host>/api/preauth/open?apiKey=ppk_…&amountUi=20"
```

#### Set up iOS Shortcuts

1. Enable Pay once via NFC → **Manage Pay** → **Copy API key** (or **Copy open URL**).
2. Shortcuts → New Shortcut → **Get Contents of URL**.
3. Method **GET**. URL:

   `https://<host>/api/preauth/open?apiKey=<pasted ppk_…>&amountUi=20`

   Optional: use Ask Each Time / Text actions to change `amountUi`.
4. Optional: **Show Notification** when the GET succeeds — that means **window opened** (e.g. “Ready — hold NFC to merchant”), not that you were charged.
5. Run the Shortcut → within ~45 seconds hold your NFC device to the merchant Collect phone.
6. After **Rotate API key**, update `apiKey` in the Shortcut URL.

#### Set up Android (Tasker or similar)

Android has no single first-party Shortcuts equivalent; use an HTTP automation app (e.g. **Tasker**):

1. Enable Pay once via NFC → **Manage Pay** → **Copy API key** / **Copy open URL**.
2. New task → **HTTP Request** (or Net → HTTP Get).
3. Method **GET**, URL:

   `https://<host>/api/preauth/open?apiKey=<pasted ppk_…>&amountUi=20`
4. Optional: toast when the GET succeeds (**window opened**, not payment settled).
5. Run the task → within ~45 seconds hold NFC to the merchant Collect phone.
6. After rotating the key, update `apiKey` in the saved URL.

### Payment link (`?recipient=<solana-address>`)

Opens a receive-only view settled to the URL recipient. **No Sign in / wallet controls** — same idea as an embed, usable top-level. Optional `?amount=` prefills (and locks) the amount.

Without `?recipient=`, the owner app requires Sign in and settles into the connected wallet.

### iframe embed

Merchant sites may embed the home route as an iframe. CSP allows `frame-ancestors *`.

Requirements when embedded:

- `?recipient=<solana-address>` is **required** (invalid/missing → error screen)
- Optional `?amount=`
- Wallet connect / disconnect is disabled
- Only the payment-link receive UI is shown (`/enable` is blocked in iframes)

Example:

```html
<iframe
  src="https://your-pay-host/?recipient=<SOLANA_ADDRESS>&amount=12.50"
  title="Pay"
  style="width:100%;height:640px;border:0"
  allow="publickey-credentials-get *"
></iframe>
```

`allow="publickey-credentials-get *"` is needed so NFC / WebAuthn taps work inside the frame.
