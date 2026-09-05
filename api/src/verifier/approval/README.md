# Revibase approval

Standing policies + one-time grants used by the Revibase owner app.

## Layering

| Layer | Owns |
|-------|------|
| **`phygital-verifier-sdk`** | `defineStandardPolicy` + parsers / verify |
| **Owner app** | Derive/compile owner settings ↔ `PolicyDocument` (caps, allowlist, extra programs) |
| **This folder** | Load/store `PolicyDocument`, hard denylist, soft UX map, Approve-once grants |

- D1 stores a plain SDK **`PolicyDocument`** only.
- GET/PUT `/policies/:token` return/accept **`PolicyDocument`** (no summary).
- Owner UI compiles settings client-side before PUT; API validates with `validatePolicy`.

```
authorizeIntent
  → loadPolicyDocument (D1 or buildDefaultPolicy)
  → evaluatePolicy
       1. strip Compute Budget
       2. hard deny: PHYGITAL_WALLET / PHYGITAL_TOKEN
       3. verify(policy, ixs)  ← SDK
       4. mapVerifyFail → soft codes / Approve-once eligible
  → on soft deny: findValidGrant (preview) / consumeGrant (sign)
```

| File | Role |
|------|------|
| `index.ts` | `authorizeIntent` |
| `policy-engine.ts` | Soft/hard UX + `evaluatePolicy` |
| `policy-db.ts` | D1 `token_policies` + `one_time_grants` |
| `policy-defaults.ts` | Default `defineStandardPolicy` when no row |
