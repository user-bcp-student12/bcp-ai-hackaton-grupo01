## Purpose

Help active wallet users identify another fictitious wallet by Peru mobile phone
and retain an owner-scoped contact for later low-value transfer selection.

## ADDED Requirements

### Requirement: Contact lookup endpoint
The system SHALL expose authenticated active-user GET /api/v1/contacts/lookup?phone=... without body, returning 200 {phone,walletId}. Invalid phone returns 400, missing/inactive recipient 404, self lookup 409 and throttling 429 in the common error shape.

#### Scenario: Lookup existing wallet
- **WHEN** an active user searches a registered active recipient using a normalized-equivalent phone
- **THEN** the response contains only normalized phone and recipient wallet ID

#### Scenario: Guarded lookup
- **WHEN** search targets a missing, inactive or self recipient
- **THEN** missing/inactive return RECIPIENT_NOT_FOUND and self returns SELF_CONTACT

### Requirement: Add contact endpoint
The system SHALL expose authenticated active-user POST /api/v1/contacts with {walletId}, returning 201 {contact:ContactView}, or 200 with the same contact if already saved. Invalid data returns 400, missing/inactive recipient 404, self or capacity limit 409.

#### Scenario: Associate recipient
- **WHEN** a user adds an active different wallet
- **THEN** exactly one association is stored for the authenticated owner

#### Scenario: Duplicate and forged owner
- **WHEN** an association is added twice or a request supplies another owner ID
- **THEN** repetition returns the same contact, while the forged extra field is rejected

### Requirement: Own contact list endpoint
The system SHALL expose authenticated active-user GET /api/v1/contacts with no body, returning 200 {contacts:ContactView[]} ordered by createdAt then ID ascending. Invalid session returns 401 and inactive account 403.

#### Scenario: Isolated contact lists
- **WHEN** two users request their own contacts
- **THEN** each sees only their saved associations, with an empty array for no contacts

#### Scenario: Inactive contact access
- **WHEN** a pending or rejected account requests contacts
- **THEN** HTTP 403 denies access without revealing directory data

### Requirement: Contact selection interface
The interface SHALL support phone search, explicit save and own-contact selection, rendering loading/error/not-found/empty states without inventing a recipient.

#### Scenario: Missing contact feedback
- **WHEN** phone search finds nobody or fails
- **THEN** clear feedback appears and no payment recipient is selected automatically
