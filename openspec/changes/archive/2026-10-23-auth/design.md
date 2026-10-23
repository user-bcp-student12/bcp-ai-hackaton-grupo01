## Contracts

Common rules/env/errors: `../scaffold/design.md#contracts`.
`UserView`, `WalletView`, document normalization and password hashing:
`../onboarding/design.md#contracts`; do not redeclare those shapes.

| Route | Request | Success | Failures |
|---|---|---|---|
| POST /api/v1/sessions | `{documentType,documentNumber,password}` | `201 {accessToken:string,tokenType:"Bearer",expiresAt:string,user:UserView}` | `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`, `429 RATE_LIMITED` |
| GET /api/v1/me | No body; bearer required | `200 {user:UserView,wallet:WalletView|null}` | `401 UNAUTHENTICATED` |
| DELETE /api/v1/sessions/current | No body; bearer required | `204` without body | `401 UNAUTHENTICATED` |

All common 500/503 errors also apply. Document/password schemas are owned by
onboarding. Invalid credentials (unknown user or wrong password) give exactly the
same error status/code/message; perform dummy scrypt verification for unknown
users. Login is allowed for all three KYC states. `/me` has no supplied user ID:
identity derives only from session. Inactive users receive their own status and
wallet=null, never somebody else's wallet or balance.

Use the HTTP Authorization header. Its value is the literal scheme `Bearer`,
one ASCII space, then the accessToken value (without angle brackets).
Generate 32 random
bytes encoded base64url. Store only SHA-256 token hash; session token is a random
secret (not a password, no JWT). Absolute expiry 3600 seconds from injected clock;
expired/revoked/unknown/malformed bearer -> 401. Refresh requires login.
Logout deletes/revokes the current session in DB and clears frontend memory/cache,
even if other user's resource IDs are provided as extra input (reject unknowns).

Migration `002-auth.sql` creates sessions(id PK, user_id FK users, token_hash
UNIQUE, created_at, expires_at); indexes token hash and expiry. Auth feature uses
onboarding public user lookup/password verification ports/use cases; adapters are
wired only in api/src/app.ts, never imported across feature boundaries.
No additional env. Limits: maximum 5 login attempts per 900 seconds per IP and
per HMAC-normalized document bucket; key derivation secret generated in memory at
startup, never logs raw documents. Process restart resets rate-limit counters:
acceptable demo limitation, not production abuse protection.
On limit return 429 with Retry-After seconds; do not include document in message.

## Context

The approved p0 ends at own wallet display; p1 contacts/payment is independent work.

## Goals / Non-Goals

**Goals:** ownership, explicit session expiry, KYC-aware display and logout.
**Non-Goals:** recovery, account editing, refresh tokens or production-grade MFA.

## Decisions

- Browser token lives only in a session provider's memory, never localStorage,
  sessionStorage, URL, logs or persisted query cache.
- Authenticated requests use one typed HTTP client. On 401 clear token and
  protected TanStack Query cache, then show login. Do not let a later user see
  a previous user's data. Logout prevents a late response from repopulating cache.
- Backend auth hook supplies session identity; inactive guard is used only for
  money/contact features, not `/me` or logout.
- API payload validation remains mandatory; unauthorized requests must not
  execute business reads/writes even if frontend route guards are bypassed.

## Risks / Trade-offs

- [Weak six-digit secret] -> scrypt, generic errors and throttling; fictitious demo.
- [Refresh loses token] -> intentional re-login, visibly explained.
- [Local HTTP] -> loopback-only default; publishing requires a later HTTPS decision.

## Migration Plan

Run 002 after 001; expired sessions cannot authenticate even if not yet purged.
Application restart retains hashed sessions until expiry but not browser tokens.
No data reset or wallet funding during login.

## Traceability

Login -> correct/wrong/unknown account, leading-zero password and throttling route
tests; session -> expiry/revoke/malformed bearer with injected clock; `/me` ->
two-user ownership, all KYC states, no refill, restart; UI -> invalid/loading/error,
logout cache clearing and p0 registration->login->wallet integration.
