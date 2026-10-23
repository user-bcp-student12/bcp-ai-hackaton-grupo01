## Purpose

Let active users transfer fictitious PEN to a saved wallet contact with atomic
balances, a durable result and safe duplicate-request handling after the cutoff.

## ADDED Requirements

### Requirement: Contact payment endpoint
The system SHALL expose authenticated POST /api/v1/payments with Idempotency-Key and {recipientType:"contact",recipientWalletId,amountCents,currency:"PEN"}. Success returns 201 {payment:PaymentView,wallet:WalletView}; replay returns 200. Invalid input returns 400, missing recipient 404 and business/conflict errors 409 as defined in design.md.

#### Scenario: Successful contact payment
- **WHEN** an active sender confirms an allowed amount to their saved active contact
- **THEN** the committed result records origin/destination wallet IDs, contact type, amount and SUCCEEDED

#### Scenario: Invalid or unauthorized payment
- **WHEN** input is fractional, zero, above configured max, self-directed or not an owned contact
- **THEN** validation/business error denies payment without changing balances

#### Scenario: Insufficient or overflow funds
- **WHEN** sender lacks balance or recipient credit exceeds the storage cap
- **THEN** the corresponding 409 error leaves both balances and payment records unchanged

### Requirement: Durable atomic idempotency
The system SHALL commit debit, credit, payment and owner-scoped key in one transaction. Same-key/same-payload retry SHALL return the same operation; changed payload SHALL return 409 IDEMPOTENCY_CONFLICT. Failure before commit SHALL leave no partial movement or consumed key.

#### Scenario: Duplicate concurrent requests
- **WHEN** simultaneous requests use the same sender, key and payload
- **THEN** only one debit, credit and payment exist and every successful response names that payment

#### Scenario: Changed payload conflict
- **WHEN** a committed key is reused with a different amount or recipient
- **THEN** HTTP 409 returns IDEMPOTENCY_CONFLICT with no second operation

#### Scenario: Competing payments and rollback
- **WHEN** distinct-key payments compete for insufficient combined funds or persistence fails before commit
- **THEN** no wallet becomes negative and failed transactions leave no partial debit or credit

### Requirement: Lookup payment by retry key
The system SHALL expose authenticated GET /api/v1/payments/by-key/:key without body, returning 200 {payment:PaymentView} only to its sender, 400 for invalid key and 404 PAYMENT_NOT_FOUND for absent or unrelated keys.

#### Scenario: Recovery after restart
- **WHEN** a committed response was lost and the sender queries its key after restart
- **THEN** the original payment is returned without a new transfer

### Requirement: Lookup participant payment
The system SHALL expose authenticated GET /api/v1/payments/:id without body, returning 200 {payment:PaymentView} to sender/recipient and 404 PAYMENT_NOT_FOUND to anyone else or for missing payment; invalid ID returns 400.

#### Scenario: Payment ownership
- **WHEN** sender, recipient and unrelated user request the same payment
- **THEN** the participants see the same immutable result and the unrelated user receives 404

### Requirement: Honest confirmation and uncertain response
The interface SHALL display recipient and amount before confirmation, retain one retry identity per intent and never show success before committed confirmation or create a new key automatically after an uncertain result.

#### Scenario: Lost response
- **WHEN** the request times out after a possible commit
- **THEN** the UI says result is unconfirmed and recovers using the same key without another debit
