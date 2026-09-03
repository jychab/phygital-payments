# Revibase API

Cloudflare Worker (Hono) behind `https://api.revibase.com`.

## Start here (5-minute map)

```
api/src/
  index.ts          Worker entry — CORS, request store, mounts domains
  shared/           Cross-cutting: HTTP helpers, D1, Solana cluster, crypto
  tokens/           Collectibles, portfolio, DAS, rarity, shortcuts
  tap/              NFC /verify-tap (counter + session cookie side-effect)
  auth/             Owner session mint + standing policy / grant routes
  verifier/         ★ Template: POST /preview + POST /sign (forkable)
```

| If you care about… | Open |
|--------------------|------|
| Wallet co-signing / custom verifier | [`src/verifier/README.md`](./src/verifier/README.md) |
| How HTTP routes are mounted | [`src/index.ts`](./src/index.ts) |
| Collectible / portfolio APIs | [`src/tokens/README.md`](./src/tokens/README.md) |
| NFC tap verify | [`src/tap/README.md`](./src/tap/README.md) |
| Session cookie + Settings policies | [`src/auth/README.md`](./src/auth/README.md) |

**Auditor tip:** `verifier/` is intentionally isolated. Revibase-specific spend
limits / “Approve once” grants live only under `verifier/approval/` — replace
that folder when forking; leave `preview.ts` / `sign.ts` alone.

## Setup

```bash
pnpm install
cp api/.dev.vars.example api/.dev.vars
# Set VERIFIER_SECRET_KEY + POLICY_SESSION_SECRET
pnpm --filter api dev
```

## Routes

| Method | Path | Domain |
|--------|------|--------|
| GET | `/health` | entry |
| GET | `/verify-tap` | `tap/` |
| POST | `/auth/token-session` | `auth/` |
| POST | `/preview` | `verifier/` |
| POST | `/sign` | `verifier/` |
| GET/PUT | `/policies/:phygitalToken` | `auth/` → uses `verifier/approval` |
| POST | `/policies/:phygitalToken/grants` | `auth/` → uses `verifier/approval` |
| GET | `/tokens/portfolio` | `tokens/` |
| GET | `/tokens/collectible` | `tokens/` |
| POST | `/tokens/collectible/batch` | `tokens/` |
| GET | `/tokens/minted` | `tokens/` |
| GET | `/tokens/rarity` | `tokens/` |
| GET | `/tokens/shortcuts` | `tokens/` |

## Env / bindings

| Name | Where | Purpose |
|------|-------|---------|
| `VERIFIER_SECRET_KEY` | secret | ed25519 co-signer for `/sign` |
| `POLICY_SESSION_SECRET` | secret | HMAC for owner session cookie |
| `SOLANA_RPC_URL` / `SOLANA_CLUSTER` | vars | DAS / chain reads |
| `JUPITER_API_KEY` | optional | verified token catalog |
| `phygital_token` | D1 | rarity + policies/grants |
| `revibase_counter` | KV | NFC counter sessions |

See [`.dev.vars.example`](./.dev.vars.example).

## Deploy

```bash
pnpm --filter api run deploy
pnpm --filter api exec wrangler d1 migrations apply phygital-token --remote
```
