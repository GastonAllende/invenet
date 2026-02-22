# Tasks: Fix Strategy Owner Field (accountId → userId)

**Branch**: `004-fix-strategy-account-id`  
**Spec**: [spec.md](./spec.md)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[US1]**: User Story 1 — Strategies owned by user, not account

---

## Phase 1: Foundational — Backend Domain & Config (Blocking)

**Purpose**: Rename the field at the domain and persistence layer first. Everything else depends on this.

- [x] T001 Rename `AccountId` → `UserId` in `apps/api/Invenet.Api/Modules/Strategies/Domain/Strategy.cs`
- [x] T002 _(depends on T001)_ Update `StrategyConfiguration.cs` — rename all `AccountId` references to `UserId`, rename DB column mapping to `user_id`, rename indexes from `ix_strategies_account_id` → `ix_strategies_user_id` in `apps/api/Invenet.Api/Modules/Strategies/Infrastructure/Data/StrategyConfiguration.cs`
- [x] T003 _(depends on T001, T002)_ Add EF Core migration to rename column `account_id` → `user_id` on the `strategies` table:
  1. Run `dotnet ef migrations add RenameStrategyAccountIdToUserId` from `apps/api/Invenet.Api/`
  2. **CRITICAL — manual edit required**: EF Core will generate a destructive `DropColumn` + `AddColumn` pair. You MUST replace it with `RenameColumn` to avoid data loss. Edit the generated migration file to use:
     ```csharp
     migrationBuilder.RenameColumn(name: "AccountId", table: "strategies", newName: "UserId", schema: "strategies");
     migrationBuilder.RenameIndex(table: "strategies", name: "ix_strategies_account_id", newName: "ix_strategies_user_id", schema: "strategies");
     migrationBuilder.RenameIndex(table: "strategies", name: "ix_strategies_account_id_active", newName: "ix_strategies_user_id_active", schema: "strategies");
     migrationBuilder.RenameIndex(table: "strategies", name: "ix_strategies_account_id_name_unique", newName: "ix_strategies_user_id_name_unique", schema: "strategies");
     ```
     See `data-model.md` for the full SQL equivalent and rollback.

**Checkpoint**: Domain model and DB schema are correct — controller work can begin

---

## Phase 2: User Story 1 — Controller & API Contract (Priority: P1)

**Goal**: All API endpoints read and write `UserId`, method names reflect user ownership, API response uses correct field name.

**Independent Test**: Call `GET /api/strategies` as an authenticated user — response must contain `userId` (not `accountId`) on each strategy object.

- [x] T004 [US1] Rename `GetCurrentAccountId()` → `GetCurrentUserId()` and all `accountId` local variables → `userId` throughout `apps/api/Invenet.Api/Modules/Strategies/API/StrategiesController.cs`
- [x] T005 [P] [US1] Confirm `GetStrategyResponse.cs` does NOT contain `accountId` or `AccountId` — owner field is intentionally not exposed in responses in `apps/api/Invenet.Api/Modules/Strategies/Features/GetStrategy/GetStrategyResponse.cs`
- [x] T006 [P] [US1] Confirm `ListStrategiesResponse.cs` / `StrategyListItem` does NOT contain `accountId` or `AccountId` in `apps/api/Invenet.Api/Modules/Strategies/Features/ListStrategies/ListStrategiesResponse.cs`
- [x] T007 [P] [US1] Confirm `CreateStrategyResponse.cs` and `UpdateStrategyResponse.cs` do NOT contain `accountId` or `AccountId` — check `apps/api/Invenet.Api/Modules/Strategies/Features/CreateStrategy/CreateStrategyResponse.cs` and `apps/api/Invenet.Api/Modules/Strategies/Features/UpdateStrategy/UpdateStrategyResponse.cs`

**Checkpoint**: Backend fully renamed — run `dotnet build` to confirm zero compile errors

---

## Phase 3: Frontend Model (Priority: P1) ✅

> **Already completed** — `accountId` → `userId` was renamed in `libs/strategies/src/lib/strategies/data-access/models/strategy.model.ts`

- [x] T008 [P] [US1] Rename `accountId` → `userId` on `Strategy` interface in `libs/strategies/src/lib/strategies/data-access/models/strategy.model.ts`

---

## Phase 4: Snapshot & Validation

- [x] T009 Confirm `ModularDbContextModelSnapshot.cs` was updated by the T003 migration and reflects `user_id` column
- [x] T010 [P] Audit `apps/api/Invenet.Api/Modules/Trades/` for any `accountId`/`account_id` references scoped to strategies (FR-005: no account-level filtering at the backend query layer) — `Trade.AccountId` is intentionally account-scoped; no changes needed
- [x] T010b [US1] Create XUnit test project: `apps/api/Invenet.Api.Tests/` — created, added to sln, project reference wired
- [x] T011 [P] [US1] _(depends on T010b)_ Write XUnit test asserting that `GET /api/strategies` returns only strategies where `UserId == authenticatedUserId` — 3 tests, all passing
- [x] T012 [P] [US1] Write Vitest unit test asserting `strategy.userId` (not `strategy.accountId`) is read from the store — 3 tests, all passing
- [x] T013 [P] [US1] Audit all strategy-related component templates — zero `accountId` references found
- [ ] T014 [P] Manual verification: log in, switch between two accounts, confirm the same strategy list appears for both (SC-002)
- [x] T015 [P] Backend build: `dotnet build` — succeeded, 0 errors, 0 warnings
- [x] T016 [P] Frontend build: `npx nx build invenet` — succeeded, 0 type errors

---

## Dependencies

```
T001 → T002 → T003
T001 → T004
T005, T006, T007 can run in parallel after T001
T008 already complete
T009, T010, T011, T012, T013 run after all Phase 1+2 tasks complete
T014, T015, T016 run last (validation gate)
```

## Parallel Execution

After T001 and T002 are done (domain + config), the following can run simultaneously:

- T003 (migration) + T004 (controller) + T005 + T006 + T007 (response DTO checks) + T010 (Trades audit)

After all implementation tasks complete, run in parallel:

- T011 (XUnit test) + T012 (Vitest test) + T013 (template audit) + T014 (manual SC-002 check) + T015 (backend build) + T016 (frontend build)
