## Contracts

Common errors: `../scaffold/design.md#contracts`; auth:
`../auth/design.md#contracts`; immutable `PaymentView` and participant lookup:
`../payments/design.md#contracts`. Do not duplicate or alter payment write shapes.

| Route | Request | Success | Errors |
|---|---|---|---|
| GET /api/v1/payments | No query/body; active bearer | `200 {payments:PaymentView[]}` | `401 UNAUTHENTICATED`, `403 ACCOUNT_INACTIVE`, common 500/503 |
| GET /api/v1/payments/:id/receipt | ID path, no body; active bearer | `200 {receipt:PaymentView}` | `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 ACCOUNT_INACTIVE`, `404 PAYMENT_NOT_FOUND`, common 500/503 |

History includes both incoming and outgoing committed payments for session's
wallet, ordered createdAt DESC then id DESC; empty is []. No filtering or arbitrary
user/wallet selector. Unknown query properties -> 400 VALIDATION_ERROR.
Receipt requires participation, unrelated and absent both 404. It is a demo JSON
receipt, not fiscal proof, PDF, bank settlement or reversible-payment guarantee.
No new tables/env. Reads use a payment-query port with participant identity
derived from session; composition root supplies the SQLite implementation.

## Context

Approved p1 completion of the original contact-payment story, after payment commit.

## Goals / Non-Goals

**Goals:** same durable reference across confirmation/history and both participants.
**Non-Goals:** sharing/export, provider status, filters, pagination UI or disputes.

## Decisions

Reuse PaymentView instead of another receipt model. Frontend derives incoming/
outgoing from current wallet and source/destination IDs, formats cents in PEN and
labels all funds fictitious. History shows loading/error/empty, links to receipt,
and never turns a failed lookup into a fabricated success.

## Risks / Trade-offs

[Unbounded local demo list] -> intentionally small fixtures; production pagination
requires later contract change, not a silent truncated response.
[Ownership leakage] -> authorization is part of the DB query and HTTP tests.

## Migration Plan

Read-only feature; use existing payment indexes. No data rewriting or new env.

## Traceability

History -> empty, ordering, incoming/outgoing, isolation/restart route tests;
receipt -> participants vs third user; UI -> same reference/amount/direction,
loading/error/empty. Full p1 journey tested separately from reduced p0 cutoff.
