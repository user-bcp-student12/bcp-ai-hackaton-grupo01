# Proposal

## Why

Once contact selection exists, a sender must transfer fictitious PEN once and trust
the result even if a response is lost. This is not part of the onboarding cutoff.

## What Changes

- Transfer integer cents between active wallets using saved contacts.
- Atomically persist balances, payment and owner-scoped idempotency.
- Confirm recipient/amount and recover an uncertain response using the same key.
- Out of scope: merchant payments, external callbacks, provider pending, reversals,
  reconciliation, real money and public rails.

## Capabilities

### New Capabilities

- `contact-payments`: atomic contact payment and duplicate-safe retry/query.

### Modified Capabilities

None.

## Impact

Payment domain, SQLite adapter/migration, schemas, confirmation UI and integration
tests. p1 after cutoff; minimal idempotency is part of payment correctness, not
the separately deferred full idempotency story.
