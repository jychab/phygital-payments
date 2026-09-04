# `auth/`

Owner-app authentication and standing-policy HTTP surface.

| File | Role |
|------|------|
| `device-routes.ts` | Platform passkey register / login / remove; token links |
| `device-session.ts` | Single device session cookie (`revibase_device_session`) |
| `device-db.ts` | `device_credentials` + `device_token_links` D1 |
| `possession-token.ts` | Short-lived tap/Hold proof for linking (not app session) |
| `pending-approvals-db.ts` | Soft-deny inbox rows |
| `passkey-verify.ts` | Accessory `verifyResponse` + resolve phygital token PDA |
| `policies-routes.ts` | `GET/PUT /policies/:token`, grants, open approvals |
| `webauthn-challenge.ts` | Platform WebAuthn challenge KV |

App session is minted only by platform passkey (register or assert).
Accessory Hold / NFC never mints the login cookie.

Admin writes (Approve / Change limits / Cancel) require device session **and**
owner link for that token. `/preview` skips pending upsert for the owner;
never upserts when the token is unlinked.
