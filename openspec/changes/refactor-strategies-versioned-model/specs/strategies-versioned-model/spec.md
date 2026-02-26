## ADDED Requirements

### Requirement: Strategy versions MUST be immutable and append-only
The system SHALL treat `StrategyVersion` as immutable snapshots. Existing versions MUST NOT be updated or deleted through application workflows.

#### Scenario: Editing a strategy creates a new version
- **WHEN** a user saves changes to an existing strategy
- **THEN** the system SHALL create a new `StrategyVersion` row instead of modifying previous version rows

#### Scenario: Existing version content remains unchanged
- **WHEN** a newer version is created for a strategy
- **THEN** all previously created versions SHALL preserve their original entry, exit, risk, and notes content

### Requirement: Strategy container and current version derivation SHALL be consistent
The system SHALL persist strategy identity separately from version content and SHALL determine the current version by the highest `VersionNumber` for each strategy.

#### Scenario: Current version selection
- **WHEN** a strategy has multiple versions
- **THEN** the system SHALL expose the version with the highest `VersionNumber` as current

#### Scenario: Initial version numbering
- **WHEN** a new strategy is created
- **THEN** the system SHALL create `StrategyVersion` with `VersionNumber = 1`

### Requirement: Version number assignment SHALL be concurrency-safe
The system SHALL allocate per-strategy version numbers without duplication under concurrent version-creation requests.

#### Scenario: Concurrent version creation requests
- **WHEN** two or more version-create requests for the same strategy are processed concurrently
- **THEN** the system SHALL persist distinct sequential version numbers with no duplicates

### Requirement: Archived strategies MUST block version creation
The system SHALL allow archived strategies to be read but MUST reject creation of new versions until unarchived.

#### Scenario: Attempt to create version on archived strategy
- **WHEN** a version-create request targets a strategy where `IsArchived = true`
- **THEN** the system SHALL reject the request and SHALL NOT create a version record
