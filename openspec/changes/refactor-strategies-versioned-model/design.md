## Context

The existing strategy implementation is effectively a mutable single-record model where editing a strategy overwrites rule content. This prevents historical reconstruction, weakens auditability, and blocks future trade-to-strategy-version linkage. The change spans backend domain/data/API layers plus Angular routing, store state, and PrimeNG page flows. It also introduces schema migration complexity because legacy strategy rows contain both strategy identity fields and rule content that must be split into container + immutable version records.

Current repository constraints and architecture:
- Backend is a modular monolith with feature-based modules and EF Core persistence.
- Frontend is Angular + PrimeNG with SignalStore patterns in feature libraries.
- Existing UX already includes list/detail/edit patterns for strategies and trades that must be preserved at a product level but refactored for versioning semantics.
- Product requires no hard-delete for strategies and append-only version history.

## Goals / Non-Goals

**Goals:**
- Introduce a durable two-entity strategy model (`Strategy` + `StrategyVersion`) with append-only versions.
- Guarantee strategy edits create new versions and never mutate historical version content.
- Provide backend contracts for list/detail/version-create/archive/unarchive and remove delete operations.
- Provide frontend routes and UX for list/create/detail/edit-new-version with read-only history browsing.
- Ensure archived strategies remain visible/readable but block creation of new versions.
- Migrate existing strategy data into versioned form with deterministic `v1` creation.
- Ensure version numbering remains correct under concurrent requests.

**Non-Goals:**
- Full trade schema linkage to `strategyVersionId` in this change (only prepare contracts and forward compatibility).
- Reworking analytics logic beyond what is needed for strategy read compatibility.
- Introducing permanent delete semantics or retention policies.
- Building cross-strategy aggregate dashboards or advanced comparison UX between versions.

## Decisions

1. Split strategy identity from rule content into two tables
- Decision: Keep stable strategy identity in `strategies` and move rule-bearing fields to `strategy_versions`.
- Rationale: Enforces immutable snapshots and avoids historical loss on edit.
- Alternative considered: single table with JSON history column.
- Why not: harder indexing/querying/version guarantees and weaker relational integrity.

2. Define current version by highest `VersionNumber`
- Decision: Persist sequential `VersionNumber` per strategy and treat max version as current.
- Rationale: deterministic ordering and user-friendly labels (`v1`, `v2`, ...).
- Alternative considered: derive current by `CreatedAt` only.
- Why not: timestamp ties and clock precision issues under concurrency.

3. Create version through explicit endpoint and append-only write path
- Decision: `POST /strategies/{id}/versions` creates a new row; no update/delete endpoint for versions.
- Rationale: separates immutable history creation from container updates and makes policy explicit.
- Alternative considered: overload `PUT /strategies/{id}` to silently create version.
- Why not: ambiguous API semantics and higher client confusion.

4. Block version creation when strategy is archived
- Decision: enforce archive guard in backend version-create handler and disable edit UI in frontend.
- Rationale: server-side enforcement is authoritative; frontend mirrors state for UX clarity.
- Alternative considered: UI-only block.
- Why not: bypassable and unsafe.

5. Concurrency-safe version numbering
- Decision: compute next version number inside a transaction with row-level lock on strategy/version set (or equivalent serializable unit), then insert version.
- Rationale: avoids duplicate version numbers under concurrent edits.
- Alternative considered: read max + insert without lock.
- Why not: race conditions produce duplicate/invalid ordering.

6. Keep create-strategy atomic (container + v1)
- Decision: `POST /strategies` performs strategy container creation and `v1` insert in one transaction.
- Rationale: strategy should never exist without an initial version.
- Alternative considered: two-step create then create-version.
- Why not: orphan/incomplete strategy risk.

7. Soft lifecycle with archive/unarchive only
- Decision: remove delete API/UI and use `IsArchived` status transitions.
- Rationale: preserves historical references and aligns with non-negotiable requirement.
- Alternative considered: hard delete with constraints.
- Why not: breaks auditability and future trade references.

8. Frontend route separation for read-only detail vs edit-new-version
- Decision: expose `/strategies/:id` for read-only and `/strategies/:id/edit` for version creation form.
- Rationale: explicit URL state and clean mental model between viewing and creating a new immutable version.
- Alternative considered: inline edit toggle within detail route.
- Why not: blurs immutable-version workflow and increases accidental edits.

9. Version history retrieval included in detail payload
- Decision: detail API returns strategy metadata, current full version, and summary history list.
- Rationale: one request powers default detail view and version picker/history table.
- Alternative considered: separate history endpoint required for every load.
- Why not: extra round trips and more store complexity for baseline page.

## Risks / Trade-offs

- [Risk] Data migration may miss legacy records with null/invalid rule fields.
  Mitigation: add migration defaults + validation audit query + pre-deploy backup.

- [Risk] Concurrency lock strategy may reduce throughput on heavily edited strategies.
  Mitigation: lock scope per strategy ID only and keep transaction small.

- [Risk] Removing delete endpoints can break existing clients.
  Mitigation: ship contract change with frontend update in same release and explicit API error/message.

- [Risk] UI complexity increases with version viewer and dual create/edit flows.
  Mitigation: centralize form component reuse and keep detail page read-only by default.

- [Risk] If archived strategies are filtered incorrectly, users may think data is lost.
  Mitigation: show archived badge in list and keep detail route accessible.

- [Trade-off] Creating a new version for every edit increases row count.
  Mitigation: acceptable for auditability; add indexes on `(StrategyId, VersionNumber DESC)`.

## Migration Plan

1. Schema migration
- Add/ensure `strategies` container columns (`Name`, `Market`, `DefaultTimeframe`, `IsArchived`, timestamps).
- Add `strategy_versions` table with FK to `strategies` and immutable fields.
- Add unique/index support for per-strategy version ordering (including `(StrategyId, VersionNumber DESC)`).

2. Data migration/backfill
- For each existing legacy strategy row, map identity fields into `strategies`.
- Create `strategy_versions` `v1` snapshot using legacy entry/exit/risk/notes fields.
- Set `CreatedByUserId` from strategy owner and `CreatedAt` from existing timestamps where possible.
- Stop reading legacy rule fields after migration; remove columns in follow-up or same migration depending rollout safety.

3. Backend rollout
- Introduce new DTOs and endpoints for list/detail/create/create-version/archive/unarchive.
- Remove or disable delete endpoints and mutable update behavior.
- Add tests for immutability, archive blocking, and version concurrency.

4. Frontend rollout
- Update routes to `/strategies`, `/strategies/new`, `/strategies/:id`, `/strategies/:id/edit`.
- Refactor store/api/components for new payloads and version workflows.
- Remove delete actions; add archive/unarchive and read-only history viewer.

5. Verification and rollback
- Verify migrated counts: strategy rows match pre-migration strategy count and each strategy has at least one version.
- Verify API behavior and UI flows in staging before production.
- Rollback strategy: restore database snapshot and revert API/frontend deployment if versioning migration fails.

## Open Questions

- Should version history default sort be strictly by `VersionNumber DESC` or include optional date sorting controls in UI now?
- Should detail route support query-param selection (`?version=X`) in the first release, or initial panel-based selection only?
- Should archived strategies be excluded from default list or included with badge by default?
- When trade linkage is added, will editing old trades be permitted to change `strategyVersionId`, or should it be immutable after save?
