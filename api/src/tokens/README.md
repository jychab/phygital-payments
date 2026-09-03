# `tokens/`

Server-only token helpers. **Wallet portfolio / collectible metadata / shortcuts
run on the app** against `NEXT_PUBLIC_SOLANA_RPC_URL` (BYO-RPC ready).

| File | Role |
|------|------|
| `routes.ts` | `/tokens/fee-balance`, `/tokens/verified`, `POST /tokens/rarity` |
| `verified-tokens.ts` | Jupiter verified catalog (API key) |
| `das-*.ts` / `collectible.ts` | DAS helpers for **rarity indexing** only |
| `collection-rarity.ts` / `rarity-db.ts` / `rarity/` | HowRare-style D1 index |
| `payment-token.ts` / `usdc-mint.ts` | Verified-catalog token shape + USDC mint |
