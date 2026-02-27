# Tasks: Trades Data Refactor

**Input**: Design documents from `/specs/005-trades-data-refactor/`
**Branch**: `005-trades-data-refactor`
**Date**: 2026-02-22

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared in-progress dependencies)
- **[Story]**: User story this task belongs to (US1, US2, US3)
- No tests requested — implementation tasks only

---

## Phase 1: Setup

**Purpose**: No new project setup needed — existing `libs/trades` and `Modules/Trades` are the targets. This phase creates the new subdirectories/files that all subsequent phases depend on.

- [x] T001 [P] Create directory `libs/trades/src/data-access/src/lib/models/` for the Trade model file
- [x] T002 [P] Create directory `libs/trades/src/data-access/src/lib/services/` for the API service file
- [x] T003 [P] Create directory `libs/trades/src/data-access/src/lib/store/` for the SignalStore file
- [x] T004 [P] Create directory `apps/api/Invenet.Api/Modules/Trades/Features/ListTrades/` for the response DTO

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend domain entity, EF Core configuration, and database migration. All user story work on the frontend is blocked until the DB schema matches the full Trade model and the API compiles.

**⚠️ CRITICAL**: All frontend tasks (Phase 3, 4) depend on T005–T008 being complete.

- [x] T005 Extend `apps/api/Invenet.Api/Modules/Trades/Domain/Trade.cs` — add `TradeType` enum (`BUY`, `SELL`), `TradeStatus` enum (`Win`, `Loss`, `Open`), and properties: `Type`, `Date`, `PositionSize`, `InvestedAmount`, `Commission`, `ProfitLoss`, `Status`
- [x] T006 Update `apps/api/Invenet.Api/Modules/Trades/Infrastructure/Data/TradeConfiguration.cs` — add EF column mappings for all 7 new fields with `HasConversion<string>()` for enums, `HasColumnType("decimal(18,x)")` for decimals, and 2 new indexes (`ix_trades_date`, `ix_trades_account_date`) per `data-model.md`
- [x] T007 Run `dotnet ef migrations add AddTradeFields` from `apps/Invenet.Api/` and verify the generated migration in `apps/api/Invenet.Api/Migrations/` adds 7 columns with correct defaults (`type DEFAULT 'BUY'`, `status DEFAULT 'Open'`, `date DEFAULT NOW()`, numerics DEFAULT 0)
- [x] T008 Run `dotnet ef database update` to apply the migration; verify all 7 new columns exist in `trades.trades`

**Checkpoint**: `dotnet build` must compile with zero errors. All 7 columns present in DB. User story phases can now begin.

---

## Phase 3: User Story 1 — View Real Trade History (Priority: P1) 🎯 MVP

**Goal**: Trade History page fetches and displays real trades from the live API endpoint, replacing all hardcoded sample data.

**Independent Test**: Log in, navigate to the Trade History page → table loads real data (or empty-state message). No hardcoded trades visible. Spinner shows during fetch. Error banner appears when API is unreachable.

### Implementation

- [x] T009 [US1] Create `apps/api/Invenet.Api/Modules/Trades/Features/ListTrades/ListTradesResponse.cs` — define `ListTradesResponse` record and `TradeListItem` record with all 14 fields per `contracts/trades-api.md`
- [x] T010 [P] [US1] Rewrite `apps/api/Invenet.Api/Modules/Trades/API/TradesController.cs` — inject `ModularDbContext`, implement `GetCurrentUserId()`, implement `GET /api/trades` action: query `Accounts` for user's account IDs, query `Trades` filtered by those IDs, order by `Date` descending, project to `TradeListItem`, return `ListTradesResponse`
- [x] T011 [P] [US1] Create `libs/trades/src/data-access/src/lib/models/trade.model.ts` — define `Trade` interface (id: string, accountId, strategyId?, type 'BUY'|'SELL', date string, symbol, entryPrice, exitPrice?, positionSize, investedAmount, commission, profitLoss, status 'Win'|'Loss'|'Open', createdAt) and `ListTradesResponse` interface per `data-model.md`
- [x] T012 [P] [US1] Create `libs/trades/src/data-access/src/lib/services/trades-api.service.ts` — `@Injectable({ providedIn: 'root' })` class injecting `HttpClient` and `API_BASE_URL`, single `list()` method calling `GET /api/trades`, `catchError` mapping 401 and generic errors to `throwError`, same pattern as `libs/accounts/src/data-access/src/lib/services/accounts-api.service.ts`
- [x] T013 [US1] Create `libs/trades/src/data-access/src/lib/store/trades.store.ts` — `signalStore` with `withState({ isLoading, error })`, `withEntities<Trade>()`, `withMethods` containing `loadTrades` via `rxMethod<void>` + `switchMap` + `setAllEntities`, and `clearError()`, same pattern as `AccountsStore`
- [x] T014 [US1] Rewrite `libs/trades/src/lib/trades/trades.ts` — inject `TradesStore`, expose `trades = store.entities`, `loading = store.isLoading`, `error = store.error` as readonly signals, call `store.loadTrades()` in `ngOnInit`, add `ChangeDetectionStrategy.OnPush`, remove all hardcoded sample data and the `Trade` interface export (now from model file), update `getStatusSeverity` to map `'Win'→'success'`, `'Loss'→'danger'`, `'Open'→'info'`
- [x] T015 [US1] Rewrite `libs/trades/src/lib/trades/trades.html` — update column headers to: Date, Symbol, Type, Entry Price, Exit Price, Position Size, Invested, Commission, P&L, Status; bind correct field names from new `Trade` model; add `@if (error())` error banner using `p-message`; show `—` for null `exitPrice`; apply red/green class to P&L column; update `colspan` to 10
- [x] T016 [US1] Create `libs/trades/src/data-access/src/index.ts` — export `Trade`, `ListTradesResponse` from `./lib/models/trade.model`, `TradesStore` from `./lib/store/trades.store`, `TradesApiService` from `./lib/services/trades-api.service`; then update `libs/trades/src/index.ts` — add `export * from './data-access/src'` alongside the existing `Trades` component export, mirroring the accounts lib pattern

**Checkpoint**: `npx nx build invenet` clean. `GET /api/trades` returns real data. Trade History page shows real trades or empty-state; no hardcoded data; spinner and error state functional.

---

## Phase 4: User Story 2 — Correct Trade Model Alignment (Priority: P1)

**Goal**: API response shape matches the frontend `Trade` interface field-for-field with correct types. No undefined or missing values at runtime.

**Independent Test**: Call `GET /api/trades` with a valid JWT and inspect the JSON response — all 14 API response fields present with correct casing and types, matching `contracts/trades-api.md` exactly.

### Implementation

- [x] T017 [US2] Verify field-by-field alignment: confirm `TradesController` projects `type` as `t.Type.ToString()` → `"BUY"`/`"SELL"` and `status` as `t.Status.ToString()` → `"Win"`/`"Loss"`/`"Open"` (PascalCase, matching frontend union types exactly); confirm `date` and `createdAt` serialize as ISO 8601 strings; confirm `strategyId` and `exitPrice` serialize as `null` (not omitted) when not set — adjust serialization options in `Program.cs` if needed (e.g., `JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.Never`)
- [x] T018 [US2] Verify frontend `Trade` interface covers all fields returned by the API — no extra fields in the API response that would silently be discarded; remove the old inline `Trade` interface from `trades.ts` if it was not already removed in T014; confirm TypeScript compiles with zero errors (`npx nx build invenet`)
- [x] T019 [US2] Verify `strategyId?: string | null` renders without error when null — check that the HTML template does not call `.toString()` or similar on `trade.strategyId` directly and that optional chaining is used where needed

**Checkpoint**: `GET /api/trades` JSON matches `contracts/trades-api.md` shape exactly. `npx nx build invenet` zero errors. No TypeScript `any` used in trades code.

---

## Phase 5: User Story 3 — Database Schema Reflects Full Trade Model (Priority: P2)

**Goal**: The `trades.trades` table has all required columns with correct types, nullability, and indexes. All pre-existing records (if any) are intact.

**Independent Test**: Connect to PostgreSQL and run `\d trades.trades` — all 15 columns present (including 7 new ones) with correct types and constraints. Row counts before/after migration match.

### Implementation

- [x] T020 [US3] Review the generated migration file (`apps/api/Invenet.Api/Migrations/<timestamp>_AddTradeFields.cs`) — confirm `Up()` adds exactly 7 columns with correct defaults and `Down()` drops them cleanly; fix any incorrect default values or type mismatches before proceeding
- [x] T021 [US3] Verify the updated `TradeConfiguration.cs` constraints match the DB schema in `data-model.md`: `symbol` max 20, `type` max 4 with string conversion, `status` max 10 with string conversion, `entry_price` and `exit_price` as `decimal(18,2)`, `position_size` as `decimal(18,4)`, `invested_amount` and `commission` and `profit_loss` as `decimal(18,2)`, `exit_price` nullable
- [x] T022 [US3] Verify `ix_trades_date` and `ix_trades_account_date` indexes exist in the DB after migration (`\di trades.*` in psql); confirm all 5 existing indexes are present (`ix_trades_account_id`, `ix_trades_strategy_id`, `ix_trades_account_strategy`, `ix_trades_date`, `ix_trades_account_date`)

**Checkpoint**: `\d trades.trades` shows all 15 columns. All 5 indexes present. `dotnet ef migrations list` shows `AddTradeFields` as applied. No existing data lost.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, linting, build validation, and smoke test.

- [x] T023 [P] Run `npx nx lint invenet && npx nx lint trades` — fix any lint errors in the trades library (unused imports from old hardcoded data removal, missing semicolons, etc.)
- [x] T024 [P] Run `cd apps/Invenet.Api && dotnet format --verify-no-changes` — fix any formatting issues in the new/modified C# files
- [x] T025 Run `npx nx build invenet --configuration=production` — confirm production build succeeds with no bundle warnings
- [ ] T026 Manual smoke test per `quickstart.md` verification checklist — start backend (`dotnet run`), start frontend (`npx nx serve invenet`), log in, navigate to Trade History, confirm: real data or empty state, spinner, error state, correct column headers, BUY/SELL tag colors, Win/Loss/Open tag colors, P&L color coding, pagination, sorting

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately, T001–T004 all parallel
- **Phase 2 (Foundational)**: Depends on Phase 1 — T005 → T006 → T007 → T008 (sequential: entity before config before migration before apply)
- **Phase 3 (US1)**: Depends on Phase 2 completion. T009 and T010 (backend) can run in parallel with T011 and T012 (frontend models/service). T013 depends on T011+T012. T014–T015 depend on T013. T016 depends on T014.
- **Phase 4 (US2)**: Depends on Phase 3 completion — alignment verification builds on working implementation
- **Phase 5 (US3)**: Depends on Phase 2 completion — can run in parallel with Phases 3 and 4 as DB verification is independent
- **Phase 6 (Polish)**: Depends on Phases 3, 4, 5 all complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (Phase 2). No dependency on US2 or US3.
- **US2 (P1)**: Depends on US1 implementation. Verification-only phase.
- **US3 (P2)**: Depends on Foundational (Phase 2) only. Can run in parallel with US1/US2.

### Parallel Opportunities Per Phase

**Phase 1**: T001, T002, T003, T004 — all 4 in parallel (different directories)

**Phase 2**: Sequential only (T005→T006→T007→T008) — each step depends on the prior

**Phase 3**:

```
T009 [P] ─────────────────────────────────────────────┐
T010 [P] (backend, needs T009) ───────────────────────┤
T011 [P] ──────────────────────┐                      │
T012 [P] ──────────────────────┤                      │
                                ▼                      │
                               T013 ─────► T014 ──► T015 ──► T016
```

**Phase 5**: T020, T021, T022 — all can run in parallel (inspection tasks)

**Phase 6**: T023 and T024 in parallel; T025 after both; T026 after T025

---

## Implementation Strategy

**MVP scope (minimum to deliver User Story 1)**:
Complete Phase 1 + Phase 2 + T009–T016 (Phase 3). This gives a fully functional Trade History page with real data. US2 and US3 are verification/validation tasks that confirm correctness.

**Suggested sequencing for a solo developer**:

1. Phase 1 (5 min) — create directories
2. Phase 2 T005–T006 (20 min) — entity + EF config
3. Phase 2 T007–T008 (10 min) — migration + apply
4. Phase 3 T009–T010 (20 min) — backend DTO + controller
5. Phase 3 T011–T012 (15 min) — frontend model + service
6. Phase 3 T013 (15 min) — store
7. Phase 3 T014–T015 (20 min) — component + template
8. Phase 3 T016 (5 min) — index exports
9. Phase 4 T017–T019 (15 min) — alignment verification
10. Phase 5 T020–T022 (10 min) — DB schema verification
11. Phase 6 T023–T026 (15 min) — lint, build, smoke test

**Estimated total**: ~2.5 hours end-to-end

---

## Task Count Summary

| Phase                                  | Tasks  | Story |
| -------------------------------------- | ------ | ----- |
| Phase 1: Setup                         | 4      | —     |
| Phase 2: Foundational                  | 4      | —     |
| Phase 3: US1 – View Real Trade History | 8      | US1   |
| Phase 4: US2 – Trade Model Alignment   | 3      | US2   |
| Phase 5: US3 – Database Schema         | 3      | US3   |
| Phase 6: Polish                        | 4      | —     |
| **Total**                              | **26** |       |

**Parallel opportunities**: 11 tasks marked `[P]`
