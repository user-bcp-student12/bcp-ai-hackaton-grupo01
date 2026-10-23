# Proposal

## Why

Participants need a stable confirmation and history matching the persisted payment.
This closes the follow-on contact payment journey, not the reduced cutoff.

## What Changes

- Provide participant-authorized receipt and newest-first transaction history.
- Show incoming/outgoing direction, reference, amount and persisted success state.
- Out of scope: PDF/fiscal receipts, sharing, filters, disputes and reconciliation.

## Capabilities

### New Capabilities

- `payment-evidence`: protected receipt and participant transaction history.

### Modified Capabilities

None.

## Impact

Evidence read feature, frontend receipt/history and read schemas. p1 after payment;
no changes to the payment transaction or session contracts.
