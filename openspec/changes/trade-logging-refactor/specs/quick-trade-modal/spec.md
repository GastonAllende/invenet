## ADDED Requirements

### Requirement: Modal opens from any page

The system SHALL provide a Quick Log Trade modal that can be opened from any page via the app topbar, without requiring navigation away from the current page.

#### Scenario: Open from topbar

- **WHEN** the user clicks "Quick Log Trade" in the topbar
- **THEN** a `p-dialog` modal appears over the current page with header "Quick Log Trade"

#### Scenario: Close without saving

- **WHEN** the user clicks "Cancel" or the dialog close button
- **THEN** the modal closes and all form fields are reset

### Requirement: Default account is the active account

The system SHALL pre-select the active account (from `ActiveAccountStore`) in the Account dropdown when the modal opens.

#### Scenario: Active account pre-selected

- **WHEN** the modal opens and an active account is set
- **THEN** the Account dropdown is pre-populated with the active account

#### Scenario: No active account

- **WHEN** the modal opens and no active account is set
- **THEN** the Account dropdown is empty and the user must select one manually

### Requirement: Strategy version resolved on strategy selection

The system SHALL fetch the selected strategy's `currentVersion` immediately when the user selects a strategy, and display the version number as a read-only field.

#### Scenario: Strategy selected

- **WHEN** the user selects a strategy from the Strategy dropdown
- **THEN** the system fetches the strategy detail and displays "v{N}" as a read-only label next to the strategy field

#### Scenario: Strategy has no current version

- **WHEN** the user selects a strategy with no current version
- **THEN** an inline warning is shown: "This strategy has no published version" and the Save button is disabled

### Requirement: Required fields validated before submission

The system SHALL prevent submission if any required field is missing or invalid.

Required fields: Account, Symbol, Direction, Strategy (with resolved version), Entry Price > 0.

#### Scenario: All required fields filled

- **WHEN** all required fields are valid and the user clicks "Save"
- **THEN** the trade is created via POST /trades and the modal closes

#### Scenario: Missing required field

- **WHEN** the user clicks "Save" with one or more required fields empty
- **THEN** inline validation messages are shown per field and the request is not sent

### Requirement: Trade created with strategyVersionId

The system SHALL submit `strategyVersionId` (resolved from the selected strategy) in the POST /trades request body. `strategyId` SHALL NOT be submitted alone.

#### Scenario: Successful trade creation

- **WHEN** the form is valid and the user clicks "Save"
- **THEN** POST /trades is called with `accountId`, `strategyVersionId`, `symbol`, `direction`, `entryPrice`, `openedAt` (current timestamp)
- **THEN** a success toast "Trade logged" is shown
- **THEN** the modal closes

#### Scenario: API error on creation

- **WHEN** POST /trades returns an error
- **THEN** an error toast is shown with the error message
- **THEN** the modal stays open so the user can retry
