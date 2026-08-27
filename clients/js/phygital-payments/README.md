# Phygital Payments SDK

TypeScript client for the `phygital-payments` Solana program.

## Install

```bash
pnpm add phygital-payments-sdk @solana/kit
```

## Usage

```ts
import {
  buildTransferChallenge,
  getTransferInstruction,
  PHYGITAL_PAYMENTS_PROGRAM_ADDRESS,
  findProgramAuthorityPda,
} from "phygital-payments-sdk";
import { beginVerify } from "phygital-token-sdk";

// Fetch latest slot hash, then:
const messageHash = buildTransferChallenge(mint, recipient, amount, slotHash);
const session = await beginVerify({ messageHash });
// Tap → secp256r1_verify + getTransferInstruction({ ..., slotNumber, clientDataJson })
```

Generated via Codama from `idl/phygital_payments.json`. Regenerate with:

```bash
pnpm generate:client
```
