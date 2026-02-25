## ADDED Requirements

### Requirement: The system SHALL maintain a global active account context
The system SHALL maintain global account context containing `accounts[]`, `activeAccountId`, and derived `activeAccount` for authenticated users.

#### Scenario: Initialize active account context
- **WHEN** account data is loaded and no valid active account is set
- **THEN** the system SHALL select and store a valid default account as `activeAccountId`

#### Scenario: Derive active account
- **WHEN** `activeAccountId` changes
- **THEN** the system SHALL expose the matching `activeAccount` derived from `accounts[]`

### Requirement: Active account context SHALL persist across sessions
The system SHALL persist `activeAccountId` between sessions and restore it when possible.

#### Scenario: Restore persisted active account
- **WHEN** the user revisits the application with previously persisted active account context
- **THEN** the system SHALL restore `activeAccountId` if it references a valid account

#### Scenario: Fallback from stale persisted account
- **WHEN** persisted `activeAccountId` no longer maps to an available account
- **THEN** the system SHALL fallback to a valid account and update persisted context

### Requirement: The UI SHALL expose active account switching and indicator
The system SHALL provide an account switcher UI and active-context indicator visible in shared navigation regions.

#### Scenario: Switch active account from dropdown
- **WHEN** the user selects another account in the active account switcher
- **THEN** the system SHALL update global active context and trigger account-scoped data refresh

#### Scenario: Display active account indicator
- **WHEN** an active account is set
- **THEN** shared UI SHALL display “Active:” with the active account identity

### Requirement: Trades SHALL require account linkage and default to active account
Trade workflows SHALL require `accountId`, default create inputs to `activeAccountId`, and persist trade records with explicit account linkage.

#### Scenario: Create trade defaults to active account
- **WHEN** the user opens trade create flow with active account context present
- **THEN** the trade form SHALL default `accountId` to `activeAccountId`

#### Scenario: Trade save with required account
- **WHEN** a trade is submitted
- **THEN** the system SHALL require `accountId` and persist the trade with that account linkage

### Requirement: Account-dependent queries SHALL enforce account context server-side
Backend account-dependent query endpoints SHALL support account filtering and SHALL validate ownership for the provided account context.

#### Scenario: Valid account-scoped trade query
- **WHEN** a trade list query includes account filter for an account owned by the authenticated user
- **THEN** the backend SHALL return only records scoped to that account

#### Scenario: Missing or invalid account context query
- **WHEN** account-dependent query endpoints receive missing or unauthorized account context
- **THEN** the backend SHALL reject the request and SHALL NOT return account-scoped data
