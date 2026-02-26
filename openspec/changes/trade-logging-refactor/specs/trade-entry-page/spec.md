## ADDED Requirements

### Requirement: Full trade form accessible at /journal/new and /journal/:id/edit

The system SHALL provide a full-page trade entry form at `/journal/new` and an edit form at `/journal/:id/edit` with all available trade fields.

#### Scenario: Navigate to new trade page

- **WHEN** the user clicks "Log Trade (full)" from the journal list
- **THEN** the user is navigated to `/journal/new` with an empty form

#### Scenario: Navigate to edit page

- **WHEN** the user clicks "Edit" on the Trade Detail page
- **THEN** the user is navigated to `/journal/:id/edit` with the form pre-populated with existing trade data

### Requirement: All trade fields available on the full form

The system SHALL provide input fields for: Account (required), Symbol (required), Direction (Long/Short, required), Strategy (required), Entry Price (required, > 0), Exit Price (optional), Opened At (required), Closed At (optional), Quantity/Size (optional), P&L (optional, manual), R-Multiple (optional, manual), Tags (optional, multi-value), Notes (optional, textarea), Status (Open/Closed).

#### Scenario: Status change to Closed requires Exit Price

- **WHEN** the user sets Status to "Closed"
- **THEN** Exit Price and Closed At fields become required and are highlighted

#### Scenario: Status set to Open

- **WHEN** the user sets Status to "Open"
- **THEN** Exit Price and Closed At are optional

### Requirement: Strategy version pinned at creation and shown on edit

The system SHALL display the `strategyVersionId` used at trade creation as a read-only "Version: v{N}" label on the edit form. Changing the strategy on edit SHALL prompt for confirmation before updating the version.

#### Scenario: Edit form shows pinned version

- **WHEN** the user opens the edit form for an existing trade
- **THEN** the strategy name is shown with a read-only "v{N}" label indicating the version used

#### Scenario: User changes strategy on edit

- **WHEN** the user selects a different strategy on the edit form
- **THEN** a confirmation dialog appears: "Changing the strategy will update the strategy version to the current version. Continue?"

#### Scenario: User confirms strategy change

- **WHEN** the user confirms the strategy change
- **THEN** the new strategy's currentVersionId is fetched and set as the new `strategyVersionId`

### Requirement: Form validates all required fields before submission

The system SHALL prevent submission if required fields are missing or invalid, showing inline validation messages.

#### Scenario: Valid form submission (new trade)

- **WHEN** all required fields are valid and the user clicks "Save"
- **THEN** POST /trades is called with all field values
- **THEN** the user is navigated to the Trade Detail page (`/journal/:id`)

#### Scenario: Valid form submission (edit trade)

- **WHEN** all required fields are valid and the user clicks "Save" on the edit form
- **THEN** PUT /trades/:id is called with the updated fields
- **THEN** the user is navigated back to the Trade Detail page (`/journal/:id`)

#### Scenario: Cancel editing

- **WHEN** the user clicks "Cancel" on the edit form
- **THEN** the user is navigated back to `/journal/:id` without saving changes
