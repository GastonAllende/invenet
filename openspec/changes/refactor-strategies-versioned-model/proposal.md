## Why

The current strategy model treats edits as in-place updates, which destroys historical rule context and makes it impossible to audit what rules were active when a trade was taken. We need immutable strategy versioning now to preserve historical truth, enforce safer change workflows, and prepare trades to reference exact strategy versions.

## What Changes

- Introduce a versioned strategy domain split into a strategy container and immutable strategy versions.
- Change strategy edit behavior so edits create new `StrategyVersion` records instead of overwriting existing rules.
- Add archive/unarchive-only lifecycle for strategies and remove hard-delete behavior from API and UI surfaces.
- Refactor backend contracts to expose list/detail/current-version/history and explicit version creation endpoints.
- Refactor frontend routes and PrimeNG pages for list/create/detail/edit-new-version flows.
- Add DB migration and data migration from legacy single-row strategy rules into `StrategyVersion` v1 snapshots.
- Add backend safeguards for archived strategy version creation and safe concurrent version numbering.
- Prepare trade integration by ensuring strategy APIs expose stable version identifiers needed for later `strategyVersionId` linkage.
- **BREAKING**: Existing strategy update semantics change from mutable updates to append-only version creation.
- **BREAKING**: Strategy delete endpoint/UI actions are removed and replaced by archive/unarchive.

## Capabilities

### New Capabilities
- `strategies-versioned-model`: Immutable strategy versioning model with append-only `StrategyVersion` snapshots and current-version derivation.
- `strategies-versioned-management`: End-to-end API and UI flows for list/create/detail/edit-as-new-version plus archive/unarchive state handling.
- `strategies-version-history-read`: Read-only history viewing for all historical versions, including selection of a specific version snapshot.

### Modified Capabilities
- None.

## Impact

- Backend strategies module: domain entities, EF configuration, migrations, data backfill, endpoint handlers/controllers, validation and concurrency logic.
- Backend API contracts/DTOs consumed by Angular strategies pages.
- Frontend strategies feature: routes, SignalStore, API service, list/detail/forms, edit-warning UX, archive/unarchive controls.
- Existing clients relying on mutable strategy updates or delete operations.
- Future trades linkage path by introducing stable strategy version identifiers for downstream reference.
