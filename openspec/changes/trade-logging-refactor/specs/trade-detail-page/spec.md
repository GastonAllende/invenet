## ADDED Requirements

### Requirement: Trade detail page accessible at /journal/:id

The system SHALL display a read-only trade detail page at `/journal/:id` showing all trade data.

#### Scenario: Navigate to detail page

- **WHEN** the user clicks on a trade row in the Journal List
- **THEN** the user is navigated to `/journal/:id`

#### Scenario: Trade not found

- **WHEN** the user navigates to `/journal/:id` with an invalid ID
- **THEN** an error message "Trade not found" is shown and a "Back to Journal" button is displayed

### Requirement: Detail page shows complete trade context

The system SHALL display: Symbol, Direction (Long/Short), Opened At, Closed At (if closed), Account name (as a badge), Strategy name + version used (e.g. "Breakout v3"), Entry Price, Exit Price (if closed), P&L, R-Multiple, Tags, Notes, and Status badge (Open/Closed).

#### Scenario: Open trade detail

- **WHEN** the trade status is Open
- **THEN** Exit Price, Closed At, P&L, and R-Multiple are shown as "—" if not set

#### Scenario: Closed trade detail

- **WHEN** the trade status is Closed
- **THEN** Exit Price, Closed At, P&L, and R-Multiple are all shown with their values

### Requirement: Edit and Archive actions available from detail page

The system SHALL display an "Edit" button that navigates to `/journal/:id/edit`, an "Archive" button for active trades, and an "Unarchive" button for archived trades.

#### Scenario: Archive a trade

- **WHEN** the user clicks "Archive" on the detail page
- **THEN** a confirmation dialog appears: "Archive this trade? It will be hidden from default views."
- **THEN** on confirm, POST /trades/:id/archive is called and the trade shows an ARCHIVED badge

#### Scenario: Unarchive a trade

- **WHEN** the user clicks "Unarchive"
- **THEN** POST /trades/:id/unarchive is called and the ARCHIVED badge is removed

#### Scenario: Back to journal list

- **WHEN** the user clicks "Back to Journal"
- **THEN** the user is navigated to `/journal`
