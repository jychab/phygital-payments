# Revibase approval (optional)

Standing policies + one-time grants used by the Revibase owner app.

**Not part of the minimal verifier.** Forkers should delete or replace this
folder and point [`../authorize.ts`](../authorize.ts) at their own logic.

| File | Role |
|------|------|
| `index.ts` | `authorizeIntent` — policies, then grants on soft deny |
| `policy-engine.ts` | Privy-shaped Solana rule evaluation |
| `policy-db.ts` | D1 `token_policies` + `one_time_grants` |
| `policy-defaults.ts` | Default payment allow rules |
| `types.ts` | Policy document / summary types |
