## ADDED Requirements

### Requirement: Journal list accessible at /journal

The system SHALL display a paginated table of trades at `/journal`.

#### Scenario: Load journal list

- **WHEN** the user navigates to `/journal`
- **THEN** trades are loaded for the active account and displayed in a table

#### Scenario: No active account

- **WHEN** no active account is set and the user navigates to `/journal`
- **THEN** a message "Select an active account to view your journal" is shown

### Requirement: Table columns include trade context

The system SHALL display the following columns: Date (Opened At), Symbol, Direction, Account name, Strategy name + version (e.g. "Momentum v2"), R-Multiple, P&L, Status badge.

#### Scenario: Columns render correctly

- **WHEN** trades are loaded
- **THEN** each row shows all required columns with proper formatting

### Requirement: Filters for account, strategy, date range, and status

The system SHALL provide filter controls above the table: Account dropdown (defaults to active account), Strategy dropdown, Date range picker, Status dropdown (All / Open / Closed).

#### Scenario: Filter by account

- **WHEN** the user selects a different account in the filter
- **THEN** trades for that account are loaded and the table updates

#### Scenario: Filter by status

- **WHEN** the user selects "Open" in the Status filter
- **THEN** only open trades are shown

#### Scenario: Filter by date range

- **WHEN** the user selects a date range
- **THEN** only trades with `openedAt` within the range are shown

#### Scenario: Filter by strategy

- **WHEN** the user selects a strategy in the Strategy filter
- **THEN** only trades linked to that strategy (any version) are shown

### Requirement: Archived trades hidden by default with toggle to show

The system SHALL hide archived trades by default. A "Show archived" checkbox SHALL allow the user to include them.

#### Scenario: Default view hides archived

- **WHEN** the journal list loads
- **THEN** trades with `isArchived: true` are not shown

#### Scenario: Show archived checkbox toggled

- **WHEN** the user checks "Show archived"
- **THEN** the list reloads and archived trades are included (shown with an ARCHIVED badge)

### Requirement: Two entry points for trade creation

The system SHALL display a primary "Log Trade (full)" button and a secondary "Quick Log Trade" button in the list header.

#### Scenario: Full trade entry

- **WHEN** the user clicks "Log Trade (full)"
- **THEN** the user is navigated to `/journal/new`

#### Scenario: Quick trade entry

- **WHEN** the user clicks "Quick Log Trade"
- **THEN** the Quick Log Trade modal opens over the current page

### Requirement: Clicking a row navigates to detail

The system SHALL navigate to `/journal/:id` when the user clicks on a trade row or a "View" action button.

#### Scenario: Row click

- **WHEN** the user clicks a trade row or the view icon
- **THEN** the user is navigated to `/journal/:id`
