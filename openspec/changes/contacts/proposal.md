# Proposal

## Why

After the onboarding cutoff, senders need to find a registered recipient by phone
and retain the correct wallet without exposing other people's account details.

## What Changes

- Search active local wallet users, add a contact association and list own contacts.
- Normalize Peru phone numbers and block self, inactive and duplicate associations.
- Add contact search/list UI and fictitious recipient fixture.
- Out of scope: device address book, merchant directory, QR and contact editing.

## Capabilities

### New Capabilities

- `wallet-contacts`: owner-scoped lookup and saved wallet contacts.

### Modified Capabilities

None.

## Impact

Contact feature, schemas, migration, seed and frontend screens. Approved p1 after
12:30 Peru; it must not become an onboarding dependency.
