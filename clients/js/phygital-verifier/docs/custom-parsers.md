# Custom parsers & built-in full schemas

## Built-in STANDARD parsers (full IDL)

Shipped under `src/parsers/` (wrappers) and `src/parsers/generated/` (IDL decode).
Every IDL instruction is decodable and listed in `fieldSchema`. Use them when authoring custom policies beyond payments defaults:

```ts
import {
  STANDARD_PARSERS,
  createVerifier,
  definePolicy,
  defineProgram,
  tokenParser,
  token2022Parser,
  systemParser,
  ataParser,
  tokenMetadataParser,
  bubblegumParser,
  coreParser,
} from "phygital-verifier-sdk";

const verify = createVerifier({ parsers: [...STANDARD_PARSERS] });

// Example: allow Token freezeAccount in addition to payments rules
const policy = definePolicy([
  defineProgram(tokenParser, {
    allows: [
      { instruction: "transferChecked" /* … */ },
      { instruction: "freezeAccount" },
    ],
  }),
]);
```

Inspect available instructions / fields:

```ts
tokenParser.fieldSchema;
// or: STANDARD_PARSERS.find(p => p.programId === "Tokenkeg…")?.fieldSchema
```

`defineStandardPolicy` only **allows** a curated subset — the parsers themselves remain full so you can opt into more instructions.

## Generate a parser for another program

Use this when you need a program that is **not** in `STANDARD_PARSERS` (for example Jupiter).

### 1. Obtain an IDL

| Format | Detection |
|--------|-----------|
| **Codama** | `kind: "rootNode"` / Codama `program.instructions` |
| **Shank** | Top-level `instructions` with `discriminant` (or `metadata.origin: "shank"`) |
| **Anchor** | `discriminator: [...]`, or fallback `sha256("global:<name>")[:8]` |

Save it in your app, e.g. `./idls/jupiter.json`.

### 2. Generate

```bash
pnpm exec phygital-verifier-generate \
  --idl ./idls/jupiter.json \
  --out ./src/parsers/jupiter.generated.ts \
  --program-id JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4
```

Generated files import `phygital-verifier-sdk/codec-readers` (`@solana/codecs`). Instruction names match the IDL exactly.

### 3. Wrap and register

```ts
import { fromGenerated, STANDARD_PARSERS, createVerifier, defineProgram } from "phygital-verifier-sdk";
import * as jupiter from "./parsers/jupiter.generated.js";

export const jupiterParser = fromGenerated(jupiter);

const verify = createVerifier({
  parsers: [...STANDARD_PARSERS, jupiterParser],
});
```
