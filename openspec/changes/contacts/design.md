## Contracts

Common errors/env: `../scaffold/design.md#contracts`; identity normalization:
`../onboarding/design.md#contracts`; bearer/active guard:
`../auth/design.md#contracts`. All routes require authenticated active account;
invalid bearer -> 401, inactive -> 403 ACCOUNT_INACTIVE, common 500/503 apply.

`ContactView = {id:string,phone:string,walletId:string,createdAt:string}`.
Phone is normalized +51; walletId is contact's wallet, never sender-selected
source. No document/email/password/user profile leaks.

| Route | Request | Success | Specific errors |
|---|---|---|---|
| GET /api/v1/contacts/lookup | Query `phone`; no body | `200 {phone:string,walletId:string}` | `400 VALIDATION_ERROR`, `404 RECIPIENT_NOT_FOUND`, `409 SELF_CONTACT`, `429 RATE_LIMITED` |
| POST /api/v1/contacts | `{walletId:string}` | `201 {contact:ContactView}`; existing link `200` same contact | `400 VALIDATION_ERROR`, `404 RECIPIENT_NOT_FOUND`, `409 SELF_CONTACT` |
| GET /api/v1/contacts | No body/query | `200 {contacts:ContactView[]}` | common errors |

Lookup and add require target currently active. No/inactive target both 404;
self target 409. Revalidate on add, do not trust earlier lookup. Source owner
comes from session; supplied owner fields are rejected. Repeated add is a
successful idempotent association, not another row.
List order createdAt ASC then id ASC; empty returns []; max demo 100 contacts,
`409 CONTACT_LIMIT_REACHED` on new add beyond 100 (duplicate still 200).
Lookup throttles by IP and authenticated user: 5/900 seconds from common config.
All active-user lookup can reveal registration existence: residual risk explicitly
limited to fictitious local data; production directory/privacy is out of scope.

Migration `003-contacts.sql`: contacts(id PK, owner_user_id FK users,
contact_user_id FK users, created_at, UNIQUE(owner_user_id,contact_user_id),
CHECK owner != contact). Wallet lookup joins users; no redundant mutable wallet
ID field in contact row. Payment stores destination wallet in its own immutable
record. Public lookup need not expose raw internal user ID.
Seed: one fictitious active recipient, valid unique test DNI/phone/email, hash
password using onboarding utility; idempotent insert never resets existing funds.
No new env. API registers contacts after auth implementation.

## Context

Approved original story, p1 only after onboarding/login p0; no optional scope.

## Goals / Non-Goals

**Goals:** verified wallet recipient and owner-scoped saved selection.
**Non-Goals:** editing, favorites, merchant contacts, address-book import.

## Decisions

Directory reads go through an onboarding port, not cross-feature adapter imports.
SQLite foreign keys and unique pair guarantee race-safe duplicate handling.
Frontend renders lookup not-found/self/inactive, list loading/error/empty and a
saved-contact selection; query cache is scoped/cleared by auth provider.

## Risks / Trade-offs

[Phone enumeration] -> auth, minimal response, throttling, fictitious data only.
[P1 steals cutoff capacity] -> dependency on completed p0 UI; priority remains p1.

## Migration Plan

Apply 003 after 001/002. Explicit seed only, no startup refill or destructive reset.

## Traceability

Lookup/add/list -> authenticated HTTP tests; self/inactive/missing/duplicate/
cross-owner -> guarded route tests with real SQLite; UI -> userEvent search,
add, list and empty/error states against contract-conforming client mock.
