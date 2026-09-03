# `tap/`

NFC accessory verification (`GET /verify-tap`).

| File | Role |
|------|------|
| `routes.ts` | Session cookie first; else query params → verify URL → counter KV → session cookie |
| `verify-dynamic-url.ts` | Cryptographic URL check (no counter) |
| `counter-session.ts` | Monotonic counter vs stored high-water mark |
| `counter-store.ts` | KV read/write (counter only, no TTL) |

A valid owner session cookie **for that accessory's pubkey** is treated as
already authenticated: the handler returns success without minting a new cookie
or re-checking the tap URL. Each accessory gets its own HttpOnly cookie
(`revibase_phygital_session.<token>`), so loading a second card does not
invalidate the first. Missing, invalid, or expired cookies fall through to URL
verification. Successful taps that resolve a phygital token mint a cookie for
that token (see `auth/`) so Settings / Approve-once can proceed without a
second Hold when possible.
