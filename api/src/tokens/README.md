# `tokens/`

Read-only wallet / collectible APIs for the Revibase app.

| File | Role |
|------|------|
| `routes.ts` | Hono mounts under `/tokens/*` |
| `portfolio.ts` | Holdings + collectibles for a wallet |
| `das-*.ts` | Helius DAS RPC wrappers |
| `collectible.ts` | DAS → Collectible mapping |
| `minted-view.ts` | Collectible + rarity + shortcuts bundle |
| `collection-rarity.ts` / `rarity-db.ts` / `rarity/` | HowRare-style indexing |
| `verified-tokens.ts` | Jupiter verified catalog (USDC fallback) |
| `shortcuts.ts` | Phantom `shortcuts.json` proxy |
| `payment-token.ts` / `usdc-mint.ts` / `amount.ts` | USDC helpers |

Start at `routes.ts`, then follow imports.
