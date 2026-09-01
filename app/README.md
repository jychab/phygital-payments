# Revibase

Next.js app for Revibase products: **Collection** (cards & accessories), **Pay**
(NFC tap-to-pay), and **Collect** (merchant receive). Runs standalone with
ConnectorKit for Solana wallets.

## Setup

From the repo root:

```bash
pnpm install
cp app/.dev.vars.example app/.dev.vars
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
| `NEXT_PUBLIC_SOLANA_CLUSTER` | No | `devnet` (default) or `mainnet` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | No | Solana RPC HTTP URL |

Uses [ConnectorKit](https://github.com/solana-foundation/connectorkit) for Solana wallet connect (Phantom, Solflare, Backpack, and other Wallet Standard wallets).

## Brand

| Layer | Name | Where |
|-------|------|--------|
| Company | **Revibase** | Wordmark on `/` only |
| Product | **Collection** | Owner hub (`/`) — cards + accessories |
| Product | **Pay** | Unminted-token journey on `/token` (NFC tap-to-pay) |
| Product | **Collect** | Merchant receive (`/collect`) |
| Object | **Card** / **Accessory** | Minted vs unminted UI on `/token` |

Document titles use Next’s `%s — Revibase` template. Do not brand every route as “Revibase Pay.”

## Code map

Routes live in `src/app`. Each has a top-level `*App` component. Domain code
(`components/`, `hooks/`, `lib/`) uses the same folder names.

| Route | Component | Folder |
|-------|-----------|--------|
| `/` | `HomeApp` → `CollectionHome` | `home/` |
| `/collect` | `CollectApp` | `collect/` |
| `/token` | `TokenApp` | `token/` |

Shared surfaces (used by multiple routes):

- `components/token/` — `TokenApp`, NFC loader, minted/unminted homes, `TokenRouteShell`
- `components/claim/` — `ClaimPanel` (NFC tap → connect → confirm in place)
- `components/pay/` — Pay setup / Hold to Pay

After a check or claim, minted tokens use `TokenMintedHome`; unminted tokens use `TokenUnmintedHome` (Pay / Collect when eligible).
One ConnectorKit provider lives in `WalletRoot` (root layout). The wallet chip
shows on every route; connect is only required for Collection, claim confirm,
Pay manage, and Collect ATA create. When a linked/recipient address is present,
the connected wallet must match (`useExpectedWallet` / `WalletSyncGate`).
The connected wallet is always passed as `owner` (not `recipient` / `expectedOwner`). Collect settles to `?recipient=` when present, otherwise the connected wallet.

Shared Pay UI lives in `components/pay/`:

- `manage-pay-panel.tsx` — pre-confirmation + this-phone authorization
- `hold-to-pay-panel.tsx` — active Pay window, success, and expiry states
- `spending-limit-panel.tsx` — per-accessory token allowance
- `api-key-panel.tsx` — issue or rotate this phone’s key (only after pre-confirmation is on)

## Modes

### Home (`/`)

Owner **Collection** hub — connect a wallet to see your collection:

- **Cards** — minted phygital tokens in a two-column grid with DAS artwork. Tap opens `/token?address=…&from=collection` (minted home + Back to Collection + verified seed).
- **Accessories** — unminted NFC accessories listed below; tap opens `/token?address=…&from=collection` (unminted home + Pay CTAs when eligible).
- No Activity or Collect on `/` — Collect is `/collect`; Pay lives on the `/token` journey for unminted tokens.

### Collect (`/collect`)

Isolated merchant receive flow. Entry via `/collect`, `/collect?recipient=`, or embed.

**Recipient** comes from `?recipient=` when present. On standalone Collect without that param, connect a wallet and payments go there. Embeds keep a sealed recipient chip and still require `?recipient=`.

- Static **Collect** header + wallet chip (standalone) or sealed destination chip (embed).
- Enter an amount, then hold NFC. Must run in Safari/Chrome (not a wallet in-app browser).
- If the recipient has no receive account for the selected token yet, standalone Collect asks to **Connect wallet** (must match recipient) and create the ATA.
- Embeds stay sealed — no wallet setup; show a finish-setup message instead.
- Success holds until you tap **Done** (no auto-reset).
- Invalid `?recipient=` shows an error gate; missing `?recipient=` on standalone prompts connect.

### Token (`/token`)

Single **task journey** for phygital tokens. After the token loads:

- **Mint linked** — card gallery UI (DAS artwork, authenticity, optional claim). No Pay or Collect.
- **No mint** — accessory UI (authenticity, claim, Pay, Collect launcher when eligible).

#### Mint shortcuts & primary CTA

Minted cards may surface [Phantom Shortcuts v2](https://github.com/phantom/shortcuts) from `{external_url}/shortcuts.json`. Revibase **never fetches that JSON from the client** — requests go through `/api/tokens/minted` or `/api/tokens/shortcuts` (server proxy; aligns with Phantom’s IP-leak safeguard).

Creators host `shortcuts.json` beside their NFT `external_url`. Revibase supports:

| Field | Source | Purpose |
|-------|--------|---------|
| `label`, `uri` | Phantom | Chip label and destination |
| `prefersExternalTarget` | Phantom | `true` → external popup; `false`/omitted → in-app iframe sheet (same root domain as `external_url`) |
| `primaryCta` | Revibase | `true` → sticky primary button when the token is **verified** |
| `type`, `platform`, `limitToCollections`, … | Phantom | Existing filters |

When `prefersExternalTarget` is false, shortcut URIs must share the same **root domain** as the token’s `external_url` (e.g. `app.project.com` is allowed when `external_url` is `https://project.com`). `solana:` URIs always open externally.

Example:

```json
{
  "version": 2,
  "shortcuts": [
    {
      "label": "Play now",
      "uri": "https://project.com/play/{{tokenId}}",
      "primaryCta": true,
      "prefersExternalTarget": false
    },
    {
      "label": "View on X",
      "uri": "https://x.com/project",
      "prefersExternalTarget": true
    }
  ]
}
```

Verified + unclaimed: shortcut CTA is primary; **Add to Wallet** stays as a secondary outline button when claim still applies.

Cold entry shows **Hold to Check**. Signed NFC URLs verify silently, then show **Registered** (on-chain). Invalid or failed tap params fall back to Hold to Check. Optional **Hold to Check** upgrades to **Confirmed**. The wallet chip is always available; connect is only required for Pay manage and claim confirm.

1. **Hold to Check** (no URL) or silent URL verify → **Registered**
2. **Unclaimed / unlocked** — **Add to Wallet** (WebAuthn tap, then connect and confirm on the same page)
3. **Locked and payment-capable** (unminted) — **Pay** via primary CTA; Pay settings, Activity, lock/remove via header **⋯** menu

Collection open (`/token?address=&from=collection`) uses the same home for that token’s mint state, with Back to Collection and a verified-owned Confirmed seed.

API keys live in browser localStorage, keyed by wallet, and are only needed when pre-confirmation is on. **This phone** issues or rotates a key. Setting a pay allowance requires a token account for that mint in the linked wallet (balance can be zero).

### Open a spending window (API key)

In-app Pay calls `GET /api/preauth/open` with the stored API key **when pre-confirmation is on**. Integrators can do the same. Settlement does **not** require an open window unless that setting is on for the payer wallet.

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

Collect opens from a payment link or cold `/collect`. With `?recipient=`, settles to that address only (wallet connect does not change the destination; header shows a sealed destination chip in embeds). Without `?recipient=` on standalone, connect a wallet and that address is the recipient. Optional `?amount=` prefills (and locks) the amount. Optional `?mint=` selects a Jupiter-verified classic SPL mint (defaults to USDC). Invalid `?recipient=` shows an error. If the recipient has no receive account yet, standalone Collect offers **Connect wallet** on the same page to create the ATA (wallet must match the recipient).

### iframe embed

Merchant sites may embed the Collect route as an iframe. CSP allows `frame-ancestors *`.

Requirements when embedded:

- `?recipient=<solana-address>` is **required** (invalid/missing → error screen)
- Optional `?amount=`
- Wallet connect / disconnect is disabled
- Only the payment-link receive UI is shown (`/token` is blocked in iframes)

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
