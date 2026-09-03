# `auth/`

Owner-app authentication and standing-policy HTTP surface.

| File | Role |
|------|------|
| `session-routes.ts` | `POST /auth/token-session` — passkey → HttpOnly cookie |
| `token-session.ts` | Mint / parse / require session cookie |
| `passkey-verify.ts` | `verifyResponse` + resolve phygital token PDA |
| `policies-routes.ts` | `GET/PUT /policies/:token`, `POST .../grants` |

Policies and grants are **Revibase product UX**. Storage + evaluation live in
[`../verifier/approval/`](../verifier/approval/). Custom verifiers usually
delete `approval/` and these policy routes together.
