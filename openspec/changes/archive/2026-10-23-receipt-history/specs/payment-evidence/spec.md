## Purpose

Give each payment participant a consistent fictitious receipt and transaction
history that reflect committed local transfers without exposing unrelated users.

## ADDED Requirements

### Requirement: Participant history endpoint
The system SHALL expose active authenticated GET /api/v1/payments without body/query, returning 200 {payments:PaymentView[]} for incoming/outgoing payments ordered newest first then ID descending. Missing session returns 401, inactive account 403 and unknown query 400.

#### Scenario: Ordered own history
- **WHEN** a participant requests history after sending and receiving payments
- **THEN** only their movements appear in the documented order

#### Scenario: Empty and isolated history
- **WHEN** a user with no payments requests history
- **THEN** an empty array is returned without unrelated transactions

### Requirement: Protected receipt endpoint
The system SHALL expose active authenticated GET /api/v1/payments/:id/receipt without body, returning 200 {receipt:PaymentView} to participants. Invalid ID returns 400, invalid session 401, inactive account 403 and missing/unrelated payment 404 PAYMENT_NOT_FOUND.

#### Scenario: Matching receipt
- **WHEN** sender and recipient request the receipt after a successful transfer
- **THEN** both receive the same reference, source/destination, amount and SUCCEEDED state

#### Scenario: Third-party receipt denied
- **WHEN** an unrelated user requests the reference
- **THEN** HTTP 404 does not reveal the payment

### Requirement: Clear payment evidence interface
The interface SHALL display the persisted reference, PEN amount, incoming/outgoing direction and fictitious-money disclaimer, with history/receipt loading/error/empty states.

#### Scenario: Durable evidence across restart
- **WHEN** the application restarts after a committed payment
- **THEN** history and receipt retain the same reference and values

#### Scenario: Receipt lookup failure
- **WHEN** receipt retrieval fails or returns not found
- **THEN** the interface explains the failure and does not display invented confirmation
