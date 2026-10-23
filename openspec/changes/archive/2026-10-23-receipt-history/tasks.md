# Tasks

## 1. Expose participant receipt and history queries
<!-- issue: area=backend size=S priority=p1 agent=auto depends=scaffold:2,payments:3 files=api/src/features/receipt-history/,packages/contracts/src/receipt-history.ts,api/src/app.ts -->
- [x] 1.1 Implement GET /payments and /payments/:id/receipt under /api/v1 through the payment query port; verify no new payment/receipt model or write side effect.
- [x] 1.2 Apply active participant authorization and deterministic history ordering; verify unrelated ID returns same 404 as missing.
- [ ] 1.3 Test inject and persisted data for incoming/outgoing, empty/order, both participants, third-party denial and restart consistency.

## 2. Display durable receipt and own transaction history
<!-- issue: area=frontend size=M priority=p1 depends=scaffold:2,1,payments:4 files=web/src/features/receipt-history/,web/src/App.tsx,tests/e2e/payment-evidence.test.ts -->
- [x] 2.1 Link payment success to receipt/history using shared PaymentView and format PEN/direction; verify identical reference and fictitious-money disclaimer.
- [x] 2.2 Render loading/error/empty/not-found without invented success and invalidate after transfer; verify ownership-aware cache behavior.
- [ ] 2.3 Test component states and full follow-on journey with both users, restart and unrelated receipt denial; report p1 separately from the p0 cutoff.
