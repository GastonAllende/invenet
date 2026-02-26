## 1. Domain Model And Persistence

- [x] 1.1 Introduce `Strategy` container entity fields (`Name`, `Market`, `DefaultTimeframe`, `IsArchived`, timestamps) and remove legacy mutable rule dependence from domain read/write paths.
- [x] 1.2 Introduce immutable `StrategyVersion` entity with FK to strategy and fields for version number, rules, notes, creation metadata.
- [x] 1.3 Add EF Core mappings, foreign key constraints, and index/uniqueness support for `(StrategyId, VersionNumber)` including descending query optimization.
- [x] 1.4 Add migration scripts to create/adjust `strategies` and `strategy_versions` schema for versioned model.

## 2. Data Migration

- [x] 2.1 Implement backfill migration that creates `StrategyVersion v1` for every legacy strategy row using existing rule content.
- [x] 2.2 Ensure migration preserves strategy identity fields and maps `CreatedByUserId`/timestamps deterministically.
- [ ] 2.3 Add migration validation checks ensuring each strategy has at least one version and version numbers start at 1.
- [x] 2.4 Remove or deprecate legacy strategy rule columns from runtime usage after backfill.

## 3. Backend API Refactor

- [x] 3.1 Implement/adjust `GET /strategies` to return strategy list with `currentVersion` summary (`id`, `versionNumber`, `createdAt`, `timeframe`).
- [x] 3.2 Implement/adjust `POST /strategies` to create strategy container and `v1` in one transaction.
- [x] 3.3 Implement/adjust `GET /strategies/{id}` to return strategy metadata, current version full content, and version history list.
- [x] 3.4 Implement `POST /strategies/{id}/versions` to append a new immutable version and reject archived strategies.
- [x] 3.5 Implement `POST /strategies/{id}/archive` and `POST /strategies/{id}/unarchive` lifecycle endpoints.
- [x] 3.6 Remove/disable any strategy hard-delete endpoint and server-side delete execution path.

## 4. Backend Integrity, Concurrency, And Validation

- [x] 4.1 Enforce append-only behavior by preventing update/delete operations on `StrategyVersion` records.
- [x] 4.2 Implement concurrency-safe next-version allocation (transaction + lock/serializable logic) to prevent duplicate version numbers.
- [x] 4.3 Enforce ownership/authorization checks for strategy detail, version creation, archive/unarchive operations.
- [x] 4.4 Ensure archived strategies remain readable via list/detail while blocking new version writes.

## 5. Frontend Routes And Feature Slice

- [x] 5.1 Refactor frontend routes to `/strategies`, `/strategies/new`, `/strategies/:id`, `/strategies/:id/edit`.
- [x] 5.2 Implement `strategies.api.ts` for versioned endpoints and DTO mapping.
- [x] 5.3 Implement/refactor `strategies.store.ts` with methods: `loadStrategies`, `loadStrategyDetail`, `createStrategy`, `createStrategyVersion`, `archiveStrategy`, `unarchiveStrategy`.
- [x] 5.4 Add/adjust domain models for strategy container, current version summary, full version, and history list entries.

## 6. Strategies UI (PrimeNG)

- [x] 6.1 Build/refactor `/strategies` list page with required columns, active/archived badge, create button, and archive/unarchive row actions.
- [x] 6.2 Build/refactor `/strategies/new` full-page form for strategy + `v1` creation with required validation and loading state.
- [x] 6.3 Build/refactor `/strategies/:id` read-only detail page with status badge, archive controls, and current version card.
- [x] 6.4 Build/refactor version history table and read-only selected-version viewer (including optional `?version=` support).
- [x] 6.5 Build/refactor `/strategies/:id/edit` full-page form prefilled from current version with warning message that save creates a new version.
- [x] 6.6 Remove all strategy delete UI/actions and replace lifecycle controls with archive/unarchive only.

## 7. Trade Forward Compatibility

- [x] 7.1 Ensure strategy detail/list responses expose stable version identifiers needed for future `strategyVersionId` linkage.
- [x] 7.2 Update frontend strategy selectors/usages to rely on current version-aware DTOs without assuming mutable strategy rules.

## 8. Verification

- [ ] 8.1 Add/adjust backend tests for immutable versions, archive blocking, no-delete constraints, and ownership checks.
- [ ] 8.2 Add/adjust backend tests for concurrent version creation to verify unique sequential version numbers.
- [ ] 8.3 Add/adjust frontend tests for route behavior, read-only detail, edit-as-new-version flow, and archive/unarchive UX.
- [ ] 8.4 Add/adjust frontend tests ensuring no strategy delete control is rendered.
- [ ] 8.5 Run targeted validation for migration results (strategy count parity and guaranteed presence of `v1` per strategy).
