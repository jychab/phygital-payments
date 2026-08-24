# Phygital Payments API Worker

Cloudflare Worker that backs the Revibase wallet UI and public NFC payment flows: browser wallet sessions, NFC spending grants, gas sponsorship, and tap verification.

For local setup (ports, `.dev.vars`, running with the Next app), see [`app/README.md`](../../app/README.md).

```bash
pnpm --filter @phygital/api-worker test
pnpm --filter @phygital/api-worker dev   # :8787
```

## Mental model (read this first)

### Two sessions

| Concept | Where | What it is |
|---------|--------|------------|
| **Wallet session** | `wallet/session*` — cookie JWT from `/api/wallet/session` | Browser Face ID login. HttpOnly cookie binds the request to a vault/wallet PDA. |
| **Agent session** | `agent/*` — minted at `/api/wallet/grant` | LazorKit on-chain spending session key bound to an NFC accessory. Used by `/api/modifyAndSign` for tap-to-pay. |

Do not confuse “session” in route names with LazorKit `sessionPda` / `sessionKey`.

### Two challenges

| Path | Audience | Store |
|------|----------|--------|
| `/api/challenge` | Public NFC apps (signer worker) | Signer service |
| `/api/wallet/auth/challenge` | Browser WebAuthn (step-up / login) | D1 (`wallet/auth-store`) |

### Storage split

- **D1 `phygital_app`**: agents, passkeys, WebAuthn challenges, rate limits, sponsor budget, idempotency, session revocations — see `platform/app-db.ts`.
- **KV `revibase_counter`**: tap anti-replay (monotonic counter + reentry grace) — see `phygital/tap/counter-store.ts`.

Signing secrets live in the **signer** worker (`SIGNER` service binding), not here.

## Folder map

```
src/
  index.ts       Route table, CORS, cron entry — start here
  routes/        Thin HTTP adapters (one folder per URL path)
  platform/      Worker runtime: request context, CORS helpers, rate limit, D1, cron
  wallet/        Browser Face ID cookie session, WebAuthn, portfolio/activity
  agent/         NFC spending grants (LazorKit session keys, assert/wrap txs)
  sponsor/       Gas sponsorship allowlists, fee payer, build/submit
  phygital/      Token lookup, accessories, tap anti-replay
  lazorkit/      On-chain program helpers (PDAs, action drafts)
  solana/        RPC, cluster, DAS collectibles
  signer/        Client to the signer worker
  shared/        Wire codecs (base64, compute-budget, sponsor-wire)
```

Import alias: `@/*` → `src/*` (e.g. `@/wallet/session`).

## Request flow

1. Exact-path `Map` lookup in `index.ts` (trailing `/` stripped).
2. `runWithRequestContext({ env, request, ctx }, …)` — AsyncLocalStorage for `getEnv()` etc.
3. Route handler (`GET` / `POST` / `DELETE` / `OPTIONS`).
4. `withAppCors` — credentialed `APP_ORIGIN` unless the response already set `Access-Control-Allow-Origin` (public `*` routes).

Hourly cron → same request context → `platform/scheduled-tasks.ts`.

## Auth layers (per-route, not middleware)

| Layer | Mechanism | Used by |
|-------|-----------|---------|
| Public `*` CORS | `corsJson` / `corsOptions` | `/api/challenge`, `/api/modifyAndSign` |
| Wallet session JWT | HttpOnly cookie | Most `/api/wallet/*` reads (`withVaultQuery`), sponsor (non–createWallet) |
| WebAuthn step-up | Session + fresh assertion | grant POST/DELETE, passkey POST |
| NFC tap | `phygital-token-sdk` verify + agent D1 record | `/api/modifyAndSign` |
| Tap anti-replay | KV grace + D1 counter | `/api/verify-tap` |

## Routes

| Path | Purpose |
|------|---------|
| `/` | Health `{ service, version }` |
| `/api/challenge` | Public NFC challenge create/status via signer |
| `/api/modifyAndSign` | Verify NFC tap, load grant, assert/wrap tx, signer `signSession` |
| `/api/verify-tap` | Hold-to-check: dynamic URL verify + anti-replay |
| `/api/tokens/phygital` | Lookup phygital token by identifier or passkey |
| `/api/tokens/collectible` | DAS collectible by mint |
| `/api/wallet/session` | Issue / read / clear wallet JWT cookie |
| `/api/wallet/auth/challenge` | Mint WebAuthn challenge into D1 |
| `/api/wallet/passkey` | Persist credentialId → pubkey (step-up) |
| `/api/wallet/grant` | List / create / delete NFC agent spending sessions |
| `/api/wallet/sponsor` | Validate instructions, fee-payer sign + submit |
| `/api/wallet/fee-payer` | Active fee-payer pubkey |
| `/api/wallet/dashboard` | Batch portfolio + accessories + agents |
| `/api/wallet/assets` | Portfolio only |
| `/api/wallet/activity` | Transaction history |
| `/api/wallet/accessories` | Owned NFC accessories |
