# Proposal

## Why

Registered people must access only their own status and wallet with document-based
credentials, including inactive accounts that need to understand their outcome.

## What Changes

- Add login, session revocation and authenticated current-user/wallet lookup.
- Keep opaque tokens only in browser memory and hash them in persistent sessions.
- Display wallet balance for active users and status only for other KYC outcomes.
- Out of scope: refresh tokens, recovery, payments and real identity validation.

## Capabilities

### New Capabilities

- `wallet-access`: authenticated session and owner-only account/wallet access.

### Modified Capabilities

None.

## Impact

Auth feature, session schemas/migration, shared auth pre-handler and frontend session
provider. p0 reduced-cutoff slice; integration depends on onboarding.
