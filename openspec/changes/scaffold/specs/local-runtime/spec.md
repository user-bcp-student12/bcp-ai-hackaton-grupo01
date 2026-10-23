## Purpose

Provide a reproducible local demo runtime that reports readiness honestly and
preserves simulated wallet data without depending on a remote financial provider.

## ADDED Requirements

### Requirement: Local health endpoint
The system SHALL expose GET /api/v1/health without body or authentication, returning 200 with {"status":"ok","simulated":true} when ready, or 503 with the common STORAGE_UNAVAILABLE error when storage is unavailable.

#### Scenario: Ready local runtime
- **WHEN** the local database is available and health is requested
- **THEN** HTTP 200 reports status ok and simulated true without exposing config

#### Scenario: Storage unavailable
- **WHEN** health is requested while the database is unavailable
- **THEN** HTTP 503 reports STORAGE_UNAVAILABLE rather than a successful readiness

### Requirement: Explicit configuration failure
The application SHALL reject invalid configuration or unavailable required persistence with a clear diagnostic, without serving a success-shaped in-memory substitute.

#### Scenario: Invalid demo configuration
- **WHEN** a required enum, integer or SQLite runtime setting is invalid
- **THEN** startup fails with a redacted actionable diagnostic before accepting traffic

### Requirement: Durable local data
The runtime SHALL retain committed demo data across restarts and SHALL NOT implicitly reset data during startup or repeated seed execution.

#### Scenario: Restart preserves data
- **WHEN** a persisted test record is committed and the application restarts
- **THEN** the same record remains available

#### Scenario: Repeated seed runner is non-destructive
- **WHEN** the explicit seed runner executes twice with a technical fixture whose value has changed
- **THEN** it does not duplicate the fixture or overwrite the changed value

### Requirement: Accessible application shell
The interface SHALL provide keyboard-accessible labeled fields, buttons, loading/error states and a visible fictitious-money disclaimer before feature screens are added.

#### Scenario: Keyboard navigation
- **WHEN** a person navigates the shell and a sample form using the keyboard
- **THEN** focus is visible, controls have accessible names and errors are announced
