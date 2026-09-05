---
name: phygital-verifier-sdk
description: >-
  Use when writing or extending Solana instruction policies with
  phygital-verifier-sdk (createVerifier, STANDARD_PARSERS,
  defineStandardPolicy, custom IDL parsers).
---

# Agent index

## Layout

| Path | Role |
|------|------|
| `src/core/` | Types, verify engine, `definePolicy` / `defineProgram` |
| `src/policy/` | STANDARD policy helpers |
| `src/parsers/` | Built-in parsers + `generated/` IDL modules |
| `docs/` | Human guides |

## Files here

| File | Purpose |
|------|---------|
| [using-sdk.md](./using-sdk.md) | Workflows |
| [policy-rules.md](./policy-rules.md) | Fail-closed rules |

## Fast path (payments)

```ts
import {
  STANDARD_PARSERS,
  createVerifier,
  defineStandardPolicy,
} from "phygital-verifier-sdk";

const verify = createVerifier({ parsers: [...STANDARD_PARSERS] });
const policy = defineStandardPolicy({ wallet });
return verify(policy, instructionsWithoutComputeBudget);
```

## Fast path (custom allow on a STANDARD program)

```ts
import { tokenParser, defineProgram, definePolicy } from "phygital-verifier-sdk";
// Inspect tokenParser.fieldSchema for exact instruction names.
```

## Fast path (new program)

1. `phygital-verifier-generate --idl … --out … --program-id …`
2. `fromGenerated` → register on verifier
3. `defineProgram(parser, { allows })`
