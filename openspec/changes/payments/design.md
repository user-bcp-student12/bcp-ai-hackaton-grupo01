## Contracts

Common schema/errors/env: `../scaffold/design.md#contracts`; User/Wallet:
`../onboarding/design.md#contracts`; auth: `../auth/design.md#contracts`;
saved-recipient relation: `../contacts/design.md#contracts`.

`PaymentView = {id:string,sourceWalletId:string,destinationWalletId:string,
recipientType:"contact",amountCents:number,currency:"PEN",status:"SUCCEEDED",
createdAt:string}`. All fields required; immutable after commit. This phase
does not accept merchant, PENDING, callbacks or reversal states.

All routes require bearer and active account; 401/403/common 500/503 apply.

| Route | Request | Success | Specific errors |
|---|---|---|---|
| POST /api/v1/payments | Header `Idempotency-Key`; `{recipientType:"contact",recipientWalletId:string,amountCents:integer,currency:"PEN"}` | `201 {payment:PaymentView,wallet:WalletView}`; replay `200` same payment and current sender wallet | `400 VALIDATION_ERROR`; `404 RECIPIENT_NOT_FOUND`; `409 SELF_TRANSFER`, `CONTACT_REQUIRED`, `INSUFFICIENT_FUNDS`, `BALANCE_LIMIT_EXCEEDED`, `IDEMPOTENCY_CONFLICT` |
| GET /api/v1/payments/by-key/:key | Encoded key path, no body | `200 {payment:PaymentView}` | `400 VALIDATION_ERROR`, `404 PAYMENT_NOT_FOUND` |
| GET /api/v1/payments/:id | Opaque ID path, no body | `200 {payment:PaymentView}` | `400 VALIDATION_ERROR`, `404 PAYMENT_NOT_FOUND` |

Idempotency key: 1..100 characters matching `^[A-Za-z0-9_-]+$`; scoped to
authenticated source user. Schema failure does not consume key. Normalize
fingerprint from validated currency, integer amount, recipient type and wallet
using ordered serialization; compare payload not raw JSON key order.
Replay checks fingerprint before mutable balance/contact validations; valid
session/active-account guard still applies. Conflict always 409, not a new charge.
Errors before commit do not consume key; committed payment/key persists across
restart. No cached generic error responses. Route by-key registers before :id.
By-key is sender-only; by-id readable by either participating wallet. Nonexistent
and unrelated resources both 404. Do not log raw URL key or bearer/body.

Amount 1..PAYMENT_MAX_CENTS inclusive. Effective limit is configured max and
available balance, not regulatory/provider promises. Enforce storage cap
100000000 on receiver balance; overflow/cap violation -> BALANCE_LIMIT_EXCEEDED,
no mutation. Source from session; recipient must be a saved contact of source,
both wallets active, not self. No float arithmetic or client balance trust.

Migration `004-payments.sql`:
- payments: id PK, source_wallet_id/destination_wallet_id FK wallets, recipient_type
  CHECK contact, amount_cents positive INTEGER, currency CHECK PEN, status CHECK
  SUCCEEDED, created_at; CHECK source != destination; indexes each wallet/date/id.
- payment_keys: source_user_id FK users, key, fingerprint, payment_id UNIQUE FK
  payments, created_at, PRIMARY KEY(source_user_id,key).
No separate pending operation table or remote event store.

Transaction: BEGIN IMMEDIATE -> existing key/fingerprint -> validate current
wallets/contact -> conditional debit with sufficient funds -> credit with cap
check -> persist payment/key -> COMMIT. Any exception rolls back all writes.
Concurrent same-key requests return one operation; different-key requests
competing for insufficient total funds cannot overdraw. DB busy timeout then
503 STORAGE_UNAVAILABLE, never success. One use case owns transaction boundary
through repository port; no adapter-to-adapter feature imports.
No new env; scaffold owns PAYMENT_MAX_CENTS.

## Context

p1 follows completed p0 and contacts; not promised for 12:30 Peru.

## Goals / Non-Goals

**Goals:** one debit/credit per confirmed intent, durable result and safe recovery.
**Non-Goals:** provider errors/PENDING, callbacks, cancellation, compensation, QR.

## Decisions

- Frontend validates amount input as a decimal PEN string with at most two decimal
  places, converts via string splitting to integer cents; no `parseFloat * 100`.
- Before send show phone/wallet and amount for explicit confirmation.
- Generate key once per confirmed intent; save `{ownerUserId,key,payload}` in
  sessionStorage for uncertain attempts (never token/password). Clear on logout;
  a later user must not restore another user's attempt. Same-user re-login may
  recover after refresh. Logout requires visible warning if result still unknown.
- A network timeout means "Resultado por confirmar", not failure or success.
  Query by key or replay same payload/key; 404 during an in-flight request is not
  proof of failure. Do not automatically create a fresh key or erase an unresolved
  attempt. A new payment intent requires resolving the old attempt first.
- On success invalidate own wallet/history queries; receipt uses returned payment.

## Risks / Trade-offs

[SQLite concurrent writes] -> serialize transactions and real temporary DB tests.
[Uncertain result confused with PENDING] -> only UI uncertainty; persisted payment
states remain SUCCEEDED or absent, no simulated provider queue.

## Migration Plan

Run 004 after 003. No destructive seed, ledger rewriting or reset. Failed writes
roll back; uncertain response is resolved from committed key, not an automatic undo.

## Traceability

Routes -> validation/auth/ownership; SQLite -> balanced debit/credit, rollback,
same-key/different-key concurrency and restart; UI -> confirmation, double click,
lost response, same-key replay, amount parser and account isolation.
