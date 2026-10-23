# Wallet mock API: Group 1

This reference summarizes the supplied OpenAPI 3.0.3 contract, version 0.2.0.
It describes available mock capabilities, not implemented application features
or approved project scope.

## Connection

- Base URL: `https://bcp-wallet-mock.yefri.workers.dev/groups/1`
- OpenAPI: `https://bcp-wallet-mock.yefri.workers.dev/groups/1/openapi.json`
- All paths below are relative to the base URL unless explicitly marked as root.
- Cloud state persists in SQLite, is shared by everyone in Group 1, and is
  isolated from the other groups. CORS is enabled.
- Use only fictitious TEST data. This is not a real banking integration.

Example invocation, on one line for Windows PowerShell:

```powershell
curl.exe "https://bcp-wallet-mock.yefri.workers.dev/groups/1/wallets/wallet-demo" -H "X-Mock-Latency-Ms: 0"
```

`X-Mock-Latency-Ms: 0` is included as supplied in the invocation example.
The supplied OpenAPI does not define this header's behavior or allowed range.
It does not declare an authentication scheme.

The seed wallet `wallet-demo` starts `ACTIVE` with `100000` cents (PEN 1,000.00).
Amounts are integer PEN cents: `1500` means PEN 15.00.
Wallet responses expose `balance`, `reserved`, and `available`, where
`available = balance - reserved`. Only pending payments reserve funds.

## Coverage for the wallet case

| Area | Main endpoints | What the mock covers |
| --- | --- | --- |
| W1: Registration and activation | `POST /kyc/verifications`, `GET /kyc/verifications/{id}`, `POST /kyc/verifications/{id}/decision`, `GET /wallets/{id}` | Simulated KYC approval, rejection, manual review and provider unavailability; wallet creation with zero balance; human decisions and wallet balances. |
| W2: Contact payments | `POST /payments`, `GET /payments?walletId=wallet-demo`, `GET /payments/{id}`, `GET /payments/{id}/receipt`, `GET /provider/payments/{id}` | Payments to `contact-demo` or `merchant-demo`, fund reservation, local/provider status, history and JSON receipts for successful or reversed payments. |
| W3: Merchant QR payments | `POST /qrs`, `POST /qrs/resolve`, then `POST /payments` with `qrId` | Fixed or open amounts for `merchant-demo`, payload resolution, expiry and matching merchant/amount validation. |
| W4: Idempotency and callbacks | `POST /payments` with `Idempotency-Key`, `POST /callbacks/payments` | Safe creation retries, conflicting-key detection, duplicate-event handling and applying provider results without duplicate charges. |
| W5: Failures and reversals | `POST /payments/{id}/resolve`, `POST /payments/{id}/reversals`, `GET /reversals/{id}`, `GET /support/cases` | Unknown or pending outcomes, provider lookup without another charge, support escalation and one full reversal per successful payment. |
| W6: Reconciliation | `GET /ledger`, `GET /settlements`, `POST /reconciliations`, `GET /reconciliations/incidents` | Comparison of wallet payments, provider report, double-entry ledger and balances; persistent incidents that can become resolved after correction and another run. |

## Payment lifecycle and retry rules

1. Create a payment with a required `Idempotency-Key` of 1-200 characters and
   JSON fields `walletId`, `recipient`, and `amountCents`. `currency` defaults
   to `PEN`; `scenario` defaults to `APPROVED`; `qrId` is optional.
2. Normal creation returns HTTP `202` with a local `PENDING` payment and
   reserves funds. Even `APPROVED` does not immediately debit the wallet:
   the provider result must be applied.
3. Obtain an event from `GET /control/events`, select it by `payment_id` and
   `target`, and submit its `id` as `eventId` to `POST /callbacks/payments`.
   Alternatively, use `POST /control/events/{id}/deliver`.
   There is no automatic webhook delivery.
4. A successful callback changes the payment to `SUCCEEDED`, debits the wallet,
   clears its reservation and creates two ledger entries. Rejection releases
   the reservation without a charge. `POST /payments/{id}/resolve` can also
   apply a final provider result without creating a new payment.
5. Retry creation using the same key and content: it returns HTTP `200` with
   the current payment. Reusing the key for different content returns
   `409 IDEMPOTENCY_CONFLICT`. Keys are scoped per wallet.

Request fields use `walletId` and `amountCents`; payment responses use
`wallet_id` and `amount`. Do not use the internal `fingerprint` field in UI logic.

## Available failure scenarios

| Capability | Scenarios and behavior |
| --- | --- |
| KYC | `APPROVED`, `REJECTED`, `MANUAL_REVIEW`, `UNAVAILABLE`. Manual review creates a pending wallet and support case; unavailability returns `503 KYC_UNAVAILABLE` without creating a wallet. Only `documentType: "TEST"` and documents beginning with `TEST-` are accepted. Repeated registrations are not prevented. |
| Payment approval/rejection | `APPROVED` and `REJECTED` create a pending local payment and enqueue the corresponding final provider event. |
| Pending provider | `PENDING` and `DELAYED_APPROVAL` require manual provider completion. Resolving while the provider remains pending returns `202` with `{"status":"PENDING","escalated":true}` and opens one support case. |
| Lost response | `TIMEOUT_AFTER_PROCESSING` returns `504` with `paymentId`, although the payment exists and the provider approved it. Recover using the same idempotency key or resolve the existing payment; do not create a new charge with another key. |
| Provider failure | `PROVIDER_ERROR` returns `503` without creating a payment or reserving funds. |
| Reversal | Requesting a reversal returns `202` with a pending reversal and enqueues a `REVERSED` event. Funds return only after confirmation. Repeating the request returns the same reversal; partial reversals are not supported. |
| Reconciliation report | `MISSING`, `AMOUNT`, `DUPLICATE`, `ORPHAN`, `CLEAR` alter or restore report rows without changing wallet, provider or ledger state. |

Reconciliation detects missing wallet/provider records, duplicates, amount and
status mismatches, ledger mismatches, unbalanced entries and balance mismatches.
It reports differences; it does not move money or repair balances.

## Controls and observability

| Endpoint | Purpose |
| --- | --- |
| `GET /health`, `GET /scenarios`, `GET /openapi.json` | Inspect availability, exact scenario options and the contract. |
| `GET /control/events` | List all group events, including delivered events. |
| `POST /control/provider/{id}/complete` | Finish a pending provider payment as `SUCCEEDED` or `REJECTED` and return an event ID. Uses the payment ID; does not update the wallet automatically. |
| `POST /control/events/{id}/deliver` | Apply or safely repeat a known event. Uses the event ID. |
| `POST /control/settlements` | Configure one report alteration per payment ID, replacing its previous alteration. |
| `GET /usage`, `GET /logs` | Cloud request counters and paginated request metadata; logs exclude bodies and headers and retain the latest 10,000 requests. |
| Root `GET /groups`, root `GET /usage/all` | Inspect all eight fixed group URLs or compare usage. Call these at `https://bcp-wallet-mock.yefri.workers.dev`, without `/groups/1`. |
| `POST /control/reset` | **Destructive:** deletes all Group 1 business data and restores the seed wallet and opening ledger entries. Affects every teammate using this group. |

## Boundaries and integration caveats

- The mock covers W1-W6 backend behaviors, not a finished wallet application.
  Screens, client validation, orchestration and user-facing error handling still
  belong to the application.
- There is no real identity verification, money movement, customer/contact
  directory, arbitrary recipient support, wallet top-up endpoint or real
  merchant integration in this contract.
- QR generation returns `qrmock:ID` text, not an image or an EMVCo payload.
  Expiry defaults to 300 seconds; valid TTL is 0-86400 seconds, with 0 expiring
  immediately.
- Callback consumption accepts an existing local event ID, not an external
  webhook payload, and does not verify signatures.
- Receipts are JSON, not PDFs. History has no pagination or date filters.
  Settlements cover the full group report, not a daily settlement cut.
- Error responses use `{"error":"CODE"}` with optional additional fields.
  Handle insufficient funds, inactive wallets and idempotency conflicts (`409`),
  missing resources (`404`), expired QR codes (`410`), provider failures (`503`)
  and processed-but-lost responses (`504`) distinctly.
- JSON bodies over 65,536 bytes return `413`. Cloud limits can return
  `429 GROUP_LIMIT_RESET_REQUIRED`; coordinate any reset with the entire group
  rather than resetting automatically.
