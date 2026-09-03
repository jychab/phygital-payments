# `tap/`

NFC accessory verification (`GET /verify-tap`).

| File | Role |
|------|------|
| `routes.ts` | Query params → verify URL → counter KV → optional session cookie |
| `verify-dynamic-url.ts` | Cryptographic URL check (no counter) |
| `counter-session.ts` | Replay / reentry rules |
| `counter-store.ts` | KV read/write |

Successful taps that resolve a phygital token also mint an owner session cookie
(see `auth/`) so Settings / Approve-once can proceed without a second Hold when
possible.
