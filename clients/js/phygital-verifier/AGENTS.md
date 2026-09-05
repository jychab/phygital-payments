# AGENTS — phygital-verifier-sdk

Solana instruction policy verifier. Policies are JSON; parsers decode; `createVerifier` checks fail-closed via the **compiled byte path** (internal compile → disc/memcmp/u64 predicates). Uncompilable `when` → `invalid_policy`.

## Orientation

```
src/index.ts      → public API map
src/core/         → types, verify, policy builders
src/policy/       → STANDARD policy preset
src/parsers/      → STANDARD_PARSERS + generated/*
```

## Read next

1. [`.agent/README.md`](./.agent/README.md)
2. [`.agent/using-sdk.md`](./.agent/using-sdk.md)
3. [`.agent/policy-rules.md`](./.agent/policy-rules.md)
4. Human [docs/](./docs/)

Package path: `clients/js/phygital-verifier` (npm: `phygital-verifier-sdk`).

## Do not

- Reintroduce DEX/audit parsers unless explicitly requested
- Allow Compute Budget in policies (engine hard-rejects)
- Use empty `and`/`or`, unknown `when` shapes, or `allowAll` + aggregates
- Rely on per-ix amount caps alone for multi-ix spend (use aggregates)
