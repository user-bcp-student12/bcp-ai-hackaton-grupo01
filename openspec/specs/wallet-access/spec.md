# wallet-access Specification

## Purpose
Allow registered people to authenticate with document credentials and safely
inspect their own wallet or non-active verification status during the local demo.

## Requirements

### Requirement: Document login endpoint
The system SHALL expose POST /api/v1/sessions with {documentType,documentNumber,password}, returning 201 {accessToken,tokenType:"Bearer",expiresAt,user:UserView}. It SHALL return 400 for invalid input, 401 INVALID_CREDENTIALS for unknown/wrong credentials and 429 RATE_LIMITED after the configured attempt limit.

#### Scenario: Correct document login
- **WHEN** an existing DNI or CE user submits their correct six-digit password
- **THEN** the API returns an opaque one-hour bearer session and their public user view

#### Scenario: Invalid credentials are indistinguishable
- **WHEN** login uses an unknown document or an incorrect password
- **THEN** both return the same 401 code/message and no session

#### Scenario: Throttled login
- **WHEN** attempts exceed five within the configured 900-second window
- **THEN** HTTP 429 provides Retry-After without exposing document data

### Requirement: Own account endpoint
The system SHALL expose authenticated GET /api/v1/me with no body, returning 200 {user:UserView,wallet:WalletView|null}. Missing, invalid, expired or revoked bearer SHALL return 401 UNAUTHENTICATED.

#### Scenario: Active wallet display
- **WHEN** an active user requests their account
- **THEN** only their wallet ID, PEN currency and current integer-cent balance are returned

#### Scenario: Inactive status display
- **WHEN** a pendiente or rechazada user logs in and requests their account
- **THEN** their own KYC status is returned with wallet=null and no payment affordance

#### Scenario: Session does not authorize another identity
- **WHEN** a user attempts to substitute another person's ID or uses an expired token
- **THEN** the system does not return the other person's data and invalid sessions return 401

### Requirement: Session revocation endpoint
The system SHALL expose authenticated DELETE /api/v1/sessions/current with no body, returning 204 without content and revoking the presented session. Invalid sessions SHALL return 401 UNAUTHENTICATED.

#### Scenario: Logout revokes access
- **WHEN** a user logs out and reuses the old token
- **THEN** logout succeeds once and subsequent protected requests return 401

### Requirement: Safe access interface
The frontend SHALL keep access tokens only in memory, render login/loading/error and KYC-aware wallet views, and clear protected state when logging out or losing authentication.

#### Scenario: Account switching clears previous data
- **WHEN** user A logs out and user B logs in
- **THEN** no wallet data from A remains visible or enters B's cache from a late response

#### Scenario: Complete reduced-cutoff journey
- **WHEN** a person registers, logs in and opens their account with active mock KYC
- **THEN** the UI shows their single fictitious wallet without creating a second opening allocation
