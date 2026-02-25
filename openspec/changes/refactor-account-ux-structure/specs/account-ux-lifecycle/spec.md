## ADDED Requirements

### Requirement: Account route states SHALL be explicit and route-driven
The system SHALL expose account lifecycle states through explicit routes, where account creation is handled at `/account/new` and account overview is handled at `/account/:id`.

#### Scenario: Navigate to account creation
- **WHEN** the user opens `/account/new`
- **THEN** the system SHALL render the full-page account creation experience and SHALL NOT render the read-only overview state

#### Scenario: Navigate to existing account
- **WHEN** the user opens `/account/:id` for an existing account
- **THEN** the system SHALL render the account overview in read-only mode by default

### Requirement: No-account users SHALL be redirected to onboarding creation
The system SHALL detect when a user has no accounts and SHALL redirect them to `/account/new` before allowing access to an account overview route.

#### Scenario: User has no accounts
- **WHEN** the user enters the account area and account count is zero
- **THEN** the system SHALL redirect to `/account/new` and SHALL display onboarding-focused creation content

### Requirement: Account creation view SHALL follow focused onboarding and management behavior
The creation state SHALL present a dedicated full-page form with account details and risk rule structure, and creation outcomes SHALL follow deterministic navigation rules.

#### Scenario: Onboarding creation content
- **WHEN** the user is in onboarding mode on `/account/new`
- **THEN** the system SHALL show title "Set up your trading account", subtitle "Define your risk rules before logging trades.", and a single primary Save action

#### Scenario: Save new account during onboarding
- **WHEN** the user successfully saves the first account in onboarding mode
- **THEN** the system SHALL persist the account, set it as active, and redirect to `/strategies/new`

#### Scenario: Save new account outside onboarding
- **WHEN** the user successfully saves a new account outside onboarding mode
- **THEN** the system SHALL persist the account, set it as active, redirect to `/account/:newId`, and show "Account created"

### Requirement: Account overview SHALL be read-only until edit mode is explicitly enabled
The system SHALL present account information in a non-editable overview mode on `/account/:id` and SHALL not display editable inputs unless edit mode is active.

#### Scenario: Overview default rendering
- **WHEN** the user views `/account/:id` with edit mode disabled
- **THEN** the system SHALL display read-only risk summary and account details cards with no editable inputs

#### Scenario: Overview actions in default mode
- **WHEN** the user is in read-only overview mode
- **THEN** the system SHALL display Edit and Add Account actions

### Requirement: Inline edit mode SHALL preserve route and support reversible changes
The system SHALL allow editing on `/account/:id` without modal dialogs and SHALL provide save/cancel actions that deterministically manage form state.

#### Scenario: Enter edit mode
- **WHEN** the user clicks Edit on `/account/:id`
- **THEN** the system SHALL keep the same route, enable edit mode, and replace read-only values with editable form controls

#### Scenario: Cancel edit mode
- **WHEN** the user clicks Cancel while edit mode is active
- **THEN** the system SHALL revert unsaved form changes and return to read-only overview mode

#### Scenario: Save edit mode
- **WHEN** the user clicks Save while edit mode is active and persistence succeeds
- **THEN** the system SHALL persist changes, return to read-only overview mode, and show "Account updated"
