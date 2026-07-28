# Phygital Pay

Next.js app for approving the payments program authority as an SPL delegate and receiving tap-authorized transfers.

## Setup

From the repo root:

```bash
pnpm install
cp app/.env.example app/.env.local
# set NEXT_PUBLIC_PRIVY_APP_ID (+ optional RPC URL)
pnpm --filter app dev
```

Or from this directory:

```bash
pnpm install
pnpm dev
```

## Modes

- **Allow** — connect wallet, set USDC spending allowance for `program_authority` (or remove it).
- **Get paid** — enter USDC amount (or open a payment link), tap a locked phygital passkey. By default your wallet pays fees and submits immediately; optionally enable **Sponsored fees** if the fee-payer worker is configured (see [`../worker/README.md`](../worker/README.md)).
