# `tap/`

NFC accessory verification (`GET /verify-tap`).

| File | Role |
|------|------|
| `routes.ts` | Query params → verify URL → counter KV → pubkey (+ optional possession token) |
| `verify-dynamic-url.ts` | Cryptographic URL check (no counter) |
| `counter-session.ts` | Monotonic counter vs stored high-water mark |
| `counter-store.ts` | KV read/write (counter only, no TTL) |

Does **not** mint the app login cookie (`revibase_device_session`). That comes
only from platform passkey register / assert under `auth/`.

On success the handler returns `secp256r1PublicKey` and `counter`. The client
derives the phygital token PDA. When possible it also returns a short-lived
`possessionToken` (HMAC) so `POST /auth/device/links` can link without a second
Hold. Expired or missing possession proofs require a fresh accessory Hold.
