## ADDED Requirements

### Requirement: The system SHALL maintain a global active account context
The system SHALL store a single `ActiveAccountId` in global application state and SHALL expose it for cross-feature consumption.

#### Scenario: Initialize active account context
- **WHEN** the user has at least one account and no active account is currently set
- **THEN** the system SHALL set `ActiveAccountId` to a valid existing account identifier before executing account-scoped features

#### Scenario: Update active account context after creation
- **WHEN** a new account is created successfully
- **THEN** the system SHALL set `ActiveAccountId` to the new account identifier

### Requirement: Account-dependent queries SHALL require and apply ActiveAccountId
The system SHALL require account context for journal, analytics, and AI query surfaces and SHALL filter data using `ActiveAccountId`.

#### Scenario: Journal query scoping
- **WHEN** the journal feature requests trade data
- **THEN** the request SHALL include `ActiveAccountId` and SHALL return only data associated with that account

#### Scenario: Analytics query scoping
- **WHEN** the analytics feature requests performance or risk aggregates
- **THEN** the request SHALL include `ActiveAccountId` and SHALL scope computation to that account

#### Scenario: AI query scoping
- **WHEN** an AI feature requests account-related insights or analysis inputs
- **THEN** the request SHALL include `ActiveAccountId` and SHALL use only account-scoped source data

### Requirement: Backend account-dependent endpoints SHALL enforce account context and ownership
The backend SHALL require account context for account-dependent endpoints and SHALL validate that the referenced account belongs to the authenticated user before returning account-scoped data.

#### Scenario: Missing account context on account-dependent endpoint
- **WHEN** a request is sent to an account-dependent endpoint without required account context
- **THEN** the backend SHALL reject the request with a validation error response

#### Scenario: Account context does not belong to authenticated user
- **WHEN** a request includes an account identifier that is not owned by the authenticated user
- **THEN** the backend SHALL reject the request with an authorization error response and SHALL NOT return account data

#### Scenario: Valid account context on account-dependent endpoint
- **WHEN** a request includes a valid account identifier owned by the authenticated user
- **THEN** the backend SHALL return data filtered to that account only

### Requirement: The user interface SHALL expose active-account context and add-account navigation
The system SHALL display the current active account indicator in a global shell context and SHALL provide an Add Account action that routes to `/account/new`.

#### Scenario: Display active account indicator
- **WHEN** `ActiveAccountId` is set
- **THEN** the shell/header or sidebar SHALL display an active-account indicator tied to that account context

#### Scenario: Add account action
- **WHEN** the user activates Add Account from account context
- **THEN** the system SHALL navigate to `/account/new`
