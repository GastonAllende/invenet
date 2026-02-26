## ADDED Requirements

### Requirement: Strategies API SHALL support versioned CRUD-by-policy workflows
The system SHALL provide strategy endpoints for list, create-with-v1, detail-with-history, create-version, archive, and unarchive, and SHALL NOT expose hard-delete operations.

#### Scenario: Create strategy creates container and v1 atomically
- **WHEN** a user submits a valid create strategy request
- **THEN** the system SHALL create both `Strategy` and `StrategyVersion v1` in one transaction

#### Scenario: Strategy delete operation absence
- **WHEN** a client attempts to discover or call strategy delete functionality
- **THEN** the system SHALL not expose a delete operation and SHALL preserve strategy records

### Requirement: Strategy list response SHALL include current version summary
The list workflow SHALL return strategy metadata with a current version summary containing `id`, `versionNumber`, `createdAt`, and `timeframe`.

#### Scenario: List strategies with current version summary
- **WHEN** the client requests the strategies list
- **THEN** each strategy item SHALL include a current version summary for the highest version

### Requirement: Strategy detail response SHALL include current version and history
The detail workflow SHALL return strategy metadata, full current version content, and version history entries.

#### Scenario: Open strategy detail
- **WHEN** the client requests strategy detail by id
- **THEN** the response SHALL include strategy fields, full current version fields, and `versions[]` history metadata

### Requirement: Frontend routing SHALL separate list/create/detail/edit-version flows
The frontend SHALL provide route-based workflows for `/strategies`, `/strategies/new`, `/strategies/:id`, and `/strategies/:id/edit`.

#### Scenario: Open create strategy route
- **WHEN** the user navigates to `/strategies/new`
- **THEN** the system SHALL render a full-page create form that creates strategy plus v1

#### Scenario: Open edit strategy route
- **WHEN** the user navigates to `/strategies/:id/edit`
- **THEN** the system SHALL render a full-page form prefilled from current version and save as a new version

### Requirement: Strategies UI SHALL enforce archive lifecycle actions
The frontend SHALL expose archive/unarchive actions and SHALL disable edit-new-version action when strategy is archived.

#### Scenario: Archived strategy detail view
- **WHEN** the user opens detail for an archived strategy
- **THEN** the system SHALL show archived status and SHALL disable edit-new-version action

#### Scenario: Unarchive and edit
- **WHEN** the user unarchives a strategy
- **THEN** the system SHALL allow creating a new version again
