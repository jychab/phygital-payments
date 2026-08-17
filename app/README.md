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

Configure the Privy app for Solana (embedded wallets + external connectors). Login methods used by this app: email and wallet.

## Modes

### Home (`/`)

Connect a wallet via Privy, then use tabs:

- **Pay** — Get Ready (open a spending window) when setup is complete. If spending cap or NFC device is missing, Home asks you to hold your NFC device — first-time setup is on **`/device`**. If this wallet has no payment verifier yet (or this browser has no key), Pay offers **Allow payment verifier**.
- **Devices** — informational list of NFC devices claimed by this wallet (no deep links). Add a device by holding an NFC tag to the phone (opens `/device`).
- **Activity** — recent payments for the connected wallet.

Header mode dropdown: **Home** | **Collect** (`/collect?recipient=<connected-wallet>`). Collect is disabled until connected.

**Pay is ready** on Home when the spending cap is set and this wallet owns at least one NFC device. Everyday Get Ready uses the payment verifier issued to **this wallet**.

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

**Setup always starts here** after an NFC tap. `/device` has **no Privy / Connect**. Status (linked wallet, spending cap set/not set, payment verifier enabled/not set) is read from chain + D1. Acting on a prompt hands off to `/device/finish` (wallet connect), the same Continue / Copy finish link pattern as claiming.

No in-app links to `/device` (tag URL only). Bare `?pk=` without tap proof shows “Hold NFC device.”

**Step 1 — Safari or Chrome (`/device`):** no wallet connect.

1. Verify tap (silent) — chip counter must be **greater than** the last value in the shared `revibase_counter` KV; the same counter may remount briefly, then needs a fresh tap
2. **Unclaimed / unlocked** — Hold NFC device for ownership transfer challenge (WebAuthn tap), then Continue / Copy finish link
3. **Locked and owned** — status card:
   - Linked wallet (address only)
   - Spending cap: Set / Not set (amount is never shown)
   - Payment verifier: Enabled / Not set
   - Primary CTA is the next gap (Set spending cap or Allow payment verifier), or **Open Home** when all three are done

**Step 2 — finish screen (`/device/finish`):** Privy wallet connect.

- `?token=` — pending claim (tap proof expires in ~3 minutes, Solana SlotHashes window). Confirm the claim tx, then **stay here** for spending cap and payment verifier if those are still missing.
- `?intent=limit&owner=` — set spending cap (no tap-proof expiry)
- `?intent=verifier&owner=` — allow payment verifier (sign message; not a transfer). After success, **Copy pay link** for Shortcuts / phone automation.

Wrong wallet: disconnect, then connect the linked owner. The payment verifier is issued to the **wallet**, not the phone or NFC device. After it is allowed, copy the pay link from this screen so Get Ready works from a shortcut.

Pending tap proofs are stored in the `pending_claim` KV namespace with TTL aligned to the SlotHashes validity window (~512 slots, ~3m 25s).

### Open a spending window (API key)

After Enable Pay, Manage Pay can **Copy API key** or **Copy open URL**. Any client can open a ~45s grant without NFC. The grant binds **mint** and **max tap amount**; Collect’s charge must match that mint and stay at or below the max. On-chain delegates are a second cap:

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

Keys in query strings may appear in CDN/proxy logs — use **Rotate API key** in Manage Pay if leaked, and update saved Shortcut URLs.

```bash
curl "https://<host>/api/preauth/open?apiKey=ppk_…&amountUi=100"
```

#### Set up iOS Shortcuts

1. Enable Pay once via NFC → **Manage Pay** → **Copy API key** (or **Copy open URL**).
2. Shortcuts → New Shortcut → **Get Contents of URL**.
3. Method **GET**. URL:

   `https://<host>/api/preauth/open?apiKey=<pasted ppk_…>&amountUi=100`

   Optional: use Ask Each Time / Text actions to change `amountUi`, and add `&mint=` for a non-USDC token.
4. Optional: **Show Notification** when the GET succeeds — that means **window opened** (e.g. “Ready — hold NFC to merchant”), not that you were charged.
5. Run the Shortcut → within ~45 seconds hold your NFC device to the merchant Collect phone.
6. After **Rotate API key**, update `apiKey` in the Shortcut URL.

#### Set up Android (Tasker or similar)

Android has no single first-party Shortcuts equivalent; use an HTTP automation app (e.g. **Tasker**):

1. Enable Pay once via NFC → **Manage Pay** → **Copy API key** / **Copy open URL**.
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
