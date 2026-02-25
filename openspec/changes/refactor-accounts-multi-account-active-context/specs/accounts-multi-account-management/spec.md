## ADDED Requirements

### Requirement: Accounts routes SHALL support list, create, and detail workflows
The system SHALL expose account management through `/accounts`, `/accounts/new`, and `/accounts/:id`, and SHALL redirect legacy `/account` to `/accounts`.

#### Scenario: Open accounts list route
- **WHEN** the user navigates to `/accounts`
- **THEN** the system SHALL render the accounts list page with multi-account management actions

#### Scenario: Open account create route
- **WHEN** the user navigates to `/accounts/new`
- **THEN** the system SHALL render a full-page account creation form

#### Scenario: Legacy account route redirect
- **WHEN** the user navigates to `/account`
- **THEN** the system SHALL redirect to `/accounts`

### Requirement: Accounts list SHALL provide active-account visibility and non-destructive actions
The accounts list SHALL display account metadata, highlight the active account, and expose actions for view, set-active, and optional archive/unarchive while prohibiting delete actions.

#### Scenario: Active account highlighted in list
- **WHEN** accounts are displayed in `/accounts`
- **THEN** the active account row SHALL be visually indicated and include an active badge

#### Scenario: Set active from list
- **WHEN** the user triggers Set Active on a non-active account
- **THEN** the selected account SHALL become active and UI context SHALL update accordingly

#### Scenario: Delete action absence
- **WHEN** the user views accounts list and detail actions
- **THEN** the system SHALL NOT display any delete account action

### Requirement: Account creation SHALL support account type and risk-rule fields
The create flow SHALL capture required account and risk-rule fields, support optional advanced fields, and set the created account as active on success.

#### Scenario: Create account with required fields
- **WHEN** the user submits `/accounts/new` with valid required account and risk-rule inputs
- **THEN** the system SHALL create the account and SHALL set it as active

#### Scenario: Create success feedback and redirect
- **WHEN** account creation succeeds
- **THEN** the system SHALL show “Account created and set as active.” and navigate to `/accounts` or `/accounts/:id`

### Requirement: Account detail SHALL default to read-only with inline edit mode
The account detail page SHALL render a read-only overview by default and SHALL support inline edit mode with save/cancel transitions without modal editing.

#### Scenario: Detail default overview mode
- **WHEN** the user opens `/accounts/:id`
- **THEN** the system SHALL show read-only risk summary and account details cards

#### Scenario: Enter and cancel inline edit mode
- **WHEN** the user clicks Edit and then Cancel
- **THEN** the system SHALL restore original values and return to read-only mode

#### Scenario: Save inline edit mode
- **WHEN** the user clicks Save in inline edit mode with valid changes
- **THEN** the system SHALL persist updates, return to read-only mode, and show “Account updated”

### Requirement: Account deletion SHALL be disallowed by contract
The system SHALL not offer or execute hard-delete account operations in UI or backend endpoints.

#### Scenario: Attempt to access account delete operation
- **WHEN** a client attempts to invoke account deletion through exposed API/UI surfaces
- **THEN** the system SHALL reject or not expose such operation and SHALL preserve account records
