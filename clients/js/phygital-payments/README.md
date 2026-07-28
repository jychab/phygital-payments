# Phygital Payments SDK

TypeScript client for the `phygital-payments` Solana program.

## Install

```bash
pnpm add phygital-payments-sdk @solana/kit
```

## Usage

```ts
import {
  buildTransferMessage,
  getTransferInstruction,
  PHYGITAL_PAYMENTS_PROGRAM_ADDRESS,
  findProgramAuthorityPda,
} from "phygital-payments-sdk";

const message = buildTransferMessage(mint, recipient, amount);
// Pass the same bytes to beginVerifyAsset({ message }) from phygital-token-sdk,
// then include secp256r1_verify + getTransferInstruction(...) in the transaction.
// program_authority must be an SPL delegate on the asset owner's token account.
```

Generated via Codama from `idl/phygital_payments.json`. Regenerate with:

```bash
pnpm generate:client
```
