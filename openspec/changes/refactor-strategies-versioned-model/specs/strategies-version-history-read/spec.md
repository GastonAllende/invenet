## ADDED Requirements

### Requirement: Version history SHALL remain permanently readable
The system SHALL retain and expose all historical strategy versions for read-only inspection.

#### Scenario: View old version after newer versions exist
- **WHEN** a strategy has versions `v1...vN` and user selects an older version
- **THEN** the system SHALL display the selected version snapshot exactly as stored

### Requirement: Detail UI SHALL provide explicit version history navigation
The strategy detail experience SHALL show a version history list with version number, created date, and created-by metadata and allow selecting a specific version snapshot.

#### Scenario: Select version from history list
- **WHEN** a user clicks a version entry in the history table
- **THEN** the system SHALL render a read-only version viewer for that selected version

#### Scenario: Open detail with version selector query parameter
- **WHEN** a user opens strategy detail using a version selector parameter such as `?version=2`
- **THEN** the system SHALL show the corresponding read-only version snapshot if it exists

### Requirement: Detail default view SHALL show current version
The strategy detail page SHALL default to showing the current version when no explicit version selection is provided.

#### Scenario: Open detail without version selector
- **WHEN** a user navigates to `/strategies/:id` without version parameter
- **THEN** the system SHALL display the current highest-numbered version snapshot
