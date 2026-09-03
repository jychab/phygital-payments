# Revibase

Next.js frontend for Revibase: **Recents** and **Wallet** on `/token`.
Backend APIs live in the sibling [`api/`](../api/) Worker (`https://api.revibase.com`).

## Setup

From the repo root:

```bash
pnpm install
cp app/.dev.vars.example app/.dev.vars
cp api/.dev.vars.example api/.dev.vars
# Terminal A — API Worker
pnpm --filter api dev
# Terminal B — Next app
pnpm --filter app dev
```
