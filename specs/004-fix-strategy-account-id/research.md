# Research: Fix Strategy Owner Field (accountId → userId)

**Date**: 2026-02-21  
**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Summary

All unknowns were resolved by reading the existing implementation. No external research required. All decisions below are direct observations from the codebase.

---

## Decision 1: Is the field name the only problem, or are the stored values also wrong?

**Decision**: The field name is the only problem. The stored values are correct.

**Rationale**: Reading `StrategiesController.cs` — `GetCurrentAccountId()` extracts `ClaimTypes.NameIdentifier` from the JWT, which is the ASP.NET Core Identity user ID. It is stored in `Strategy.AccountId`. The value stored is the user's GUID, which is what we want. The column just has the wrong name.

**Consequence**: The EF Core migration only needs to **rename the column** (`account_id` → `user_id`). No data values need updating. This is safe to run against a live database with existing data.

---

## Decision 2: Do any API response DTOs expose the owner field?

**Decision**: No. None of the response DTOs expose the owner field.

**Rationale**: Direct inspection of all four response types:

- `GetStrategyResponse` — `(Id, Name, Description, IsDeleted, CreatedAt, UpdatedAt)`
- `StrategyListItem` — same fields
- `CreateStrategyResponse` — same fields
- `UpdateStrategyResponse` — same fields

No `accountId` or `userId` property in any of them.

**Consequence**: T005, T006, T007 in tasks.md are pure confirmation checks — no code changes needed in response DTOs. No API consumer (frontend or otherwise) reads an owner field from strategy responses. The TypeScript `Strategy` model interface (`accountId` → `userId`) was the only consumer-visible field, and it is already fixed.

---

## Decision 3: Is there a cross-module reference in the Trades module that needs updating?

**Decision**: The Trades module references `Strategy` via a navigation property and `StrategyId` FK only. It does not reference `AccountId`.

**Rationale**: `Trade.cs` has a `StrategyId` FK and a `Strategy` navigation property. `TradeConfiguration.cs` configures this FK. Neither references `AccountId` on the strategy side.

**Consequence**: T010 (Trades module audit) will confirm no changes are needed. The `ix_trades_account_id` index visible in the 2020218 migration belongs to the `trades` table's own `AccountId` column, not to a strategy field.

---

## Decision 4: Does a backend test project exist?

**Decision**: No existing XUnit test project was found in `apps/api/`.

**Rationale**: `find apps/api -name "*.Tests.csproj"` returned no results.

**Consequence**: T011 (backend XUnit test) requires creating a new test project. Given the fix scope, this may be deferred — the constitution flag is noted but the rename is verifiable via build + manual API call. This is captured as a lower-priority task in tasks.md.

---

## Decision 5: EF Core migration approach

**Decision**: Use `RenameColumn` in a new EF Core migration.

**Rationale**: EF Core supports `migrationBuilder.RenameColumn(name: "AccountId", table: "strategies", newName: "UserId", schema: "strategies")`. This is the correct approach for a column rename — it does not drop and recreate the column (which would lose data) but issues an `ALTER TABLE RENAME COLUMN` on PostgreSQL. Indexes referencing the old column must also be dropped and recreated with the new name.

**Alternatives considered**: Dropping and recreating the column — rejected, would lose all existing data. A new parallel column with data copy — rejected, unnecessary complexity.

---

## All Clarifications Resolved

| Item                              | Status       |
| --------------------------------- | ------------ |
| Values correct, only name wrong   | ✅ Confirmed |
| No API consumer reads owner field | ✅ Confirmed |
| Trades module needs no changes    | ✅ Confirmed |
| No existing backend test project  | ✅ Confirmed |
| Migration approach: RenameColumn  | ✅ Decided   |
