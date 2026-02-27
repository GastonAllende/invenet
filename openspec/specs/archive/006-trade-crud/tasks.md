# Tasks: Trade CRUD — Add, Edit and Delete Trades

**Input**: Design documents from `/specs/006-trade-crud/`
**Branch**: `006-trade-crud`
**Date**: 2026-02-23

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared in-progress dependencies)
- **[Story]**: User story this task belongs to (US1, US2, US3)
- No tests requested — implementation tasks only

---

## Phase 1: Setup

**Purpose**: Create the new component directories and the new backend feature directories that subsequent phases write files into.

- [ ] T001 [P] Create directory `libs/trades/src/lib/feature/trade-shell/` for the shell component
- [ ] T002 [P] Create directory `libs/trades/src/lib/ui/trade-list/` for the list component
- [ ] T003 [P] Create directory `libs/trades/src/lib/ui/trade-form/` for the form component
- [ ] T004 [P] Create directory `apps/api/Invenet.Api/Modules/Trades/Features/CreateTrade/` for create DTOs
- [ ] T005 [P] Create directory `apps/api/Invenet.Api/Modules/Trades/Features/UpdateTrade/` for update DTOs
- [ ] T006 [P] Create directory `apps/api/Invenet.Api/Modules/Trades/Features/GetTrade/` for the shared response DTO

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types used by all three user stories. Both tasks can run in parallel and must complete before Phase 3 begins.

**⚠️ CRITICAL**: No user-story work can begin until these items compile successfully.

- [ ] T007 [P] Add TypeScript DTO interfaces to `libs/trades/src/data-access/src/lib/models/trade.model.ts` — append `CreateTradeRequest` (12 fields incl. `accountId`), `UpdateTradeRequest` (= `Omit<CreateTradeRequest, 'accountId'>`), and `TradeResponse` (14 fields incl. `id` and `createdAt`) per `data-model.md`
- [ ] T008 [P] Create `apps/api/Invenet.Api/Modules/Trades/Features/GetTrade/GetTradeResponse.cs` — define a `record GetTradeResponse(Guid Id, Guid AccountId, Guid? StrategyId, string Type, DateTime Date, string Symbol, decimal EntryPrice, decimal? ExitPrice, decimal PositionSize, decimal InvestedAmount, decimal Commission, decimal ProfitLoss, string Status, DateTime CreatedAt)` with 14 fields; this is the shared shape returned by both POST and PUT

**Checkpoint**: `dotnet build` compiles with zero errors. TypeScript model file has no type errors (`npx nx build invenet`). All user-story phases can now begin.

---

## Phase 3: User Story 1 — Create a Trade (Priority: P1) 🎯 MVP

**Goal**: A user can open a "New Trade" dialog, fill in the form, and save a trade that immediately appears in the list.

**Independent Test**: From Trade History, click "New Trade" → dialog opens with blank form; fill in Symbol=AAPL, Type=BUY, Date=today, EntryPrice=175, PositionSize=100, Account=any → InvestedAmount auto-calculates to 17500 → click Save → dialog closes, success toast, trade appears at top of list.

### Backend

- [ ] T009 [P] [US1] Create `apps/api/Invenet.Api/Modules/Trades/Features/CreateTrade/CreateTradeRequest.cs` — define `record CreateTradeRequest(Guid AccountId, Guid? StrategyId, string Type, DateTime Date, string Symbol, decimal EntryPrice, decimal? ExitPrice, decimal PositionSize, decimal InvestedAmount, decimal Commission, decimal ProfitLoss, string Status)` with `[Required]` / `[Range]` / `[StringLength]` attributes per `data-model.md` validation rules
- [ ] T010 [P] [US1] Create `apps/api/Invenet.Api/Modules/Trades/Features/CreateTrade/CreateTradeResponse.cs` — use a type alias: `using CreateTradeResponse = Invenet.Api.Modules.Trades.Features.GetTrade.GetTradeResponse;` (do **not** use positional record inheritance — C# positional records require a full constructor re-declaration which is not "reuse"); alternatively, have the POST action return `GetTradeResponse` directly without a separate response type
- [ ] T011 [US1] Add `POST /api/trades` action to `apps/api/Invenet.Api/Modules/Trades/API/TradesController.cs` — call `GetCurrentUserId()`, verify `AccountId` belongs to the user (query Accounts table), validate `StrategyId` if provided, map request to new `Trade` entity, `_db.Trades.Add(entity)`, `await _db.SaveChangesAsync()`, return `Created` with a `CreateTradeResponse` mapped from the saved entity

### Frontend Data-Access

- [ ] T012 [P] [US1] Add `create(request: CreateTradeRequest): Observable<TradeResponse>` to `libs/trades/src/data-access/src/lib/services/trades-api.service.ts` — `this.http.post<TradeResponse>(\`${this.baseUrl}/api/trades\`, request)`with`catchError`mapping 400/403 to descriptive messages, same pattern as`AccountsApiService.create()`
- [ ] T013 [US1] Add `createTrade` rxMethod to `libs/trades/src/data-access/src/lib/store/trades.store.ts` — `rxMethod<CreateTradeRequest>(pipe(switchMap(req => this.api.create(req).pipe(tap(response => patchState(store, addEntity(response), { lastSavedId: response.id })), catchError(err => { patchState(store, { error: err.message }); return EMPTY; })))))`; add `lastSavedId: null as string | null` to initial state shape; add `clearLastSaved()` method setting `lastSavedId` to `null`; add `clearError()` method setting `error` to `null` if not already present

### Frontend UI

- [ ] T014 [P] [US1] Create `libs/trades/src/lib/ui/trade-list/trade-list.component.ts` — standalone presentational component with `ChangeDetectionStrategy.OnPush`; inputs: `trades = input<Trade[]>([])`, `isLoading = input(false)`; outputs: `create = output<void>()`, `edit = output<Trade>()`, `delete = output<string>()`; no logic beyond emitting events
- [ ] T015 [P] [US1] Create `libs/trades/src/lib/ui/trade-list/trade-list.component.html` — PrimeNG `p-table` with columns: Date, Symbol, Type, Entry Price, Exit Price, Position Size, Invested, Commission, P&L, Status, Actions; a "New Trade" button above the table emitting `(create)`; per-row Edit and Delete icon buttons emitting `(edit)` and `(delete)` — bind `[disabled]="isLoading()"` to both the Edit and Delete buttons to prevent duplicate actions during in-flight operations (FR-013); reuse tag severity logic from existing `trades.html` for Type and Status columns
- [ ] T016 [P] [US1] Create `libs/trades/src/lib/ui/trade-list/trade-list.component.css` — minimal styles (empty file is acceptable; copy any table-specific styles extracted from the current `trades.css`)
- [ ] T017 [P] [US1] Create `libs/trades/src/lib/ui/trade-form/trade-form.component.ts` — standalone component with `ChangeDetectionStrategy.OnPush`; `@Input trade` signal (`input<Trade | null>(null)`); `FormGroup` with all 11 editable fields (symbol, type, date, entryPrice, exitPrice, positionSize, commission, status, strategyId, accountId) plus investedAmount and profitLoss as **disabled** display-only controls; `effect()` watching `trade()` to `patchValue` when editing; second `effect()` watching `entryPrice` + `positionSize` changes to recalculate `investedAmount`; third `effect()` watching `exitPrice` + `entryPrice` + `positionSize` + `commission` to recalculate `profitLoss`; `@Input accounts = input<Account[]>([])` and `@Input strategies = input<Strategy[]>([])`; `save = output<CreateTradeRequest | UpdateTradeRequest>()` and `cancel = output<void>()`; on save: call `markAllAsTouched()`, guard against invalid, then emit **`form.getRawValue()`** (not `form.value`) — `getRawValue()` includes disabled controls (investedAmount, profitLoss) which `form.value` silently omits, causing a backend 400
- [ ] T018 [P] [US1] Create `libs/trades/src/lib/ui/trade-form/trade-form.component.html` — PrimeNG form layout inside a `<form>`: `p-select` for Type (BUY/SELL), `p-datepicker` for Date, `p-inputtext` for Symbol, `p-inputnumber` for EntryPrice/ExitPrice/PositionSize/Commission, `p-select` for Status, `p-select` for Account (bound to `accounts()` input), `p-select` for Strategy (optional, bound to `strategies()` input); two disabled `p-inputnumber` fields for InvestedAmount and ProfitLoss; Save button with `[disabled]="isLoading()"` (add `isLoading = input(false)` to component inputs); Cancel button; inline validation messages using `@if (form.get('field')?.invalid && form.get('field')?.touched)` — the Save button **must** be disabled while any save is in progress (FR-013)
- [ ] T019 [P] [US1] Create `libs/trades/src/lib/ui/trade-form/trade-form.component.css` — empty or minimal form layout styles
- [ ] T020 [US1] Create `libs/trades/src/lib/feature/trade-shell/trade-shell.component.ts` — standalone smart component; inject `TradesStore`, `AccountsStore`, `StrategiesStore`, `MessageService`; in `ngOnInit`: call `store.loadTrades()` — **this component is the sole owner of `loadTrades()`; `trades.ts` must NOT call it**; also call `accountsStore.loadAccounts()` if `accountsStore.accounts().length === 0`, and `strategiesStore.loadStrategies({})` if `strategiesStore.activeStrategies().length === 0`; `showFormDialog = signal(false)`; `selectedTrade = signal<Trade | null>(null)`; **success detection**: `effect()` watching `store.lastSavedId()` — when it changes to a non-null value, close the dialog (`showFormDialog(false)`, `selectedTrade(null)`) and show a success toast, then call `store.clearLastSaved()`; do **not** use `isLoading` transition for success detection (it also fires on errors); **error detection**: separate `effect()` watching `store.error()` to show error toast and call `store.clearError()`; `openCreateDialog()` — sets `selectedTrade(null)`, `showFormDialog(true)`; `onSave(request)` — calls `store.createTrade(request)` (distinguishes create vs update by `selectedTrade()` being null); `onCancel()` — `showFormDialog(false)`, `selectedTrade(null)`
- [ ] T021 [US1] Create `libs/trades/src/lib/feature/trade-shell/trade-shell.component.html` — renders `<lib-trade-list>` bound to `store.entities()`, `store.isLoading()`, listeners for `(create)`, `(edit)`, `(delete)`; a `<p-dialog>` (do **not** set `[closable]="false"` — keep the default frame-close control for FR-012) containing `<lib-trade-form>` bound to `selectedTrade()`, `accountsStore.accounts()`, `strategiesStore.activeStrategies()`, `[isLoading]="store.isLoading()"`, with `(save)` and `(cancel)` outputs wired to shell methods; `<p-toast>` and `<p-confirmdialog>` declarations
- [ ] T022 [US1] Create `libs/trades/src/lib/feature/trade-shell/trade-shell.component.css` — empty or dialog-width override
- [ ] T023 [US1] Modify `libs/trades/src/lib/trades/trades.ts` — remove all current table/orchestration logic; template becomes simply `<lib-trade-shell />`; do **not** inject `TradesStore` or call `loadTrades()` here — `TradeShellComponent` owns that call; update `libs/trades/src/index.ts` to also export `TradeShellComponent` from `./lib/feature/trade-shell/trade-shell.component`

**Checkpoint**: `npx nx build invenet` zero errors. `POST /api/trades` with valid JWT returns 201. Clicking "New Trade" opens dialog; filling and saving adds trade to list; cancel discards. Error toast appears on 4xx/5xx.

---

## Phase 4: User Story 2 — Edit a Trade (Priority: P2)

**Goal**: A user can click Edit on any trade row, see the dialog pre-populated with its current values, modify any field, and save — the list immediately reflects the updated values.

**Independent Test**: Click Edit on any trade → dialog opens with all fields pre-filled → change Symbol to TSLA → click Save → dialog closes, success toast, Symbol column shows TSLA.

### Backend

- [ ] T024 [P] [US2] Create `apps/api/Invenet.Api/Modules/Trades/Features/UpdateTrade/UpdateTradeRequest.cs` — `record UpdateTradeRequest(Guid? StrategyId, string Type, DateTime Date, string Symbol, decimal EntryPrice, decimal? ExitPrice, decimal PositionSize, decimal InvestedAmount, decimal Commission, decimal ProfitLoss, string Status)` with same validation attributes as `CreateTradeRequest` minus `AccountId`
- [ ] T025 [P] [US2] Create `apps/api/Invenet.Api/Modules/Trades/Features/UpdateTrade/UpdateTradeResponse.cs` — use a type alias: `using UpdateTradeResponse = Invenet.Api.Modules.Trades.Features.GetTrade.GetTradeResponse;` (do **not** use positional record inheritance); alternatively, return `GetTradeResponse` directly from the PUT action
- [ ] T026 [US2] Add `PUT /api/trades/{id}` action to `apps/api/Invenet.Api/Modules/Trades/API/TradesController.cs` — call `GetCurrentUserId()`, load trade by `id` (404 if missing), verify trade's account belongs to user (403 if not), map request fields onto entity properties, `await _db.SaveChangesAsync()`, return `Ok(new UpdateTradeResponse(...))` with the updated values

### Frontend Data-Access

- [ ] T027 [P] [US2] Add `update(id: string, request: UpdateTradeRequest): Observable<TradeResponse>` to `libs/trades/src/data-access/src/lib/services/trades-api.service.ts` — `this.http.put<TradeResponse>(\`${this.baseUrl}/api/trades/${id}\`, request)`with`catchError`
- [ ] T028 [US2] Add `updateTrade` rxMethod to `libs/trades/src/data-access/src/lib/store/trades.store.ts` — accepts `{ id: string; request: UpdateTradeRequest }`; calls `this.api.update(id, request)`; on success calls `patchState(store, updateEntity({ id, changes: response }), { lastSavedId: response.id })`; on **404 error** (trade deleted in another session) call `patchState(store, removeEntity(id))` to remove the stale entry from the list; on other errors set `error` signal

### Frontend UI

- [ ] T029 [US2] Extend `libs/trades/src/lib/feature/trade-shell/trade-shell.component.ts` — add `openEditDialog(trade: Trade)` that sets `selectedTrade(trade)` and `showFormDialog(true)`; update `onSave(request)` to branch on `selectedTrade()`: if non-null call `store.updateTrade({ id: selectedTrade()!.id, request: request as UpdateTradeRequest })`; the `request` arriving here originates from `form.getRawValue()` (set in T017) so `investedAmount` and `profitLoss` are guaranteed to be present; wire `(edit)` output from `TradeListComponent` to `openEditDialog`

**Checkpoint**: `PUT /api/trades/{id}` returns 200 with updated entity. Clicking Edit populates the form; saving reflects changes in the list. Returns 403 when trade belongs to a different user. Returns 404 for unknown id.

---

## Phase 5: User Story 3 — Delete a Trade (Priority: P3)

**Goal**: A user can permanently delete any trade from the list after confirming a warning prompt.

**Independent Test**: Click Delete on any trade → confirmation prompt appears → click Confirm → trade removed from list, success toast → clicking Cancel leaves the list unchanged.

### Backend

- [ ] T030 [US3] Add `DELETE /api/trades/{id}` action to `apps/api/Invenet.Api/Modules/Trades/API/TradesController.cs` — call `GetCurrentUserId()`, load trade by `id` (404 if missing), verify ownership (403 if not owner), `_db.Trades.Remove(trade)`, `await _db.SaveChangesAsync()`, return `NoContent()`

### Frontend Data-Access

- [ ] T031 [P] [US3] Add `delete(id: string): Observable<void>` to `libs/trades/src/data-access/src/lib/services/trades-api.service.ts` — `this.http.delete<void>(\`${this.baseUrl}/api/trades/${id}\`)`with`catchError`
- [ ] T032 [US3] Add `deleteTrade` rxMethod to `libs/trades/src/data-access/src/lib/store/trades.store.ts` — accepts `id: string`; calls `this.api.delete(id)`; on success calls `patchState(store, removeEntity(id), { lastSavedId: id })`; on **404 error** (trade already deleted in another session) also call `patchState(store, removeEntity(id))` to remove the stale entry (per spec edge cases); on other errors set `error` signal

### Frontend UI

- [ ] T033 [US3] Extend `libs/trades/src/lib/feature/trade-shell/trade-shell.component.ts` — inject `ConfirmationService`; add `onDelete(id: string)` that calls `this.confirmationService.confirm({ message: 'This action cannot be undone.', accept: () => this.store.deleteTrade(id) })`; wire `(delete)` output from `TradeListComponent` to `onDelete`; add `<p-confirmdialog />` to the shell template if not already present

**Checkpoint**: `DELETE /api/trades/{id}` returns 204. Confirm removes trade from list; Cancel leaves it unchanged. Error toast on 403/404/network failure.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Exports, lint, production build, and smoke test.

- [ ] T034 [P] Verify `libs/trades/src/index.ts` exports — confirm `TradeShellComponent`, `TradeListComponent`, `TradeFormComponent`, `TradesStore`, `TradesApiService`, all model interfaces are exported correctly; add any missing exports
- [ ] T035 [P] Run `npx nx lint invenet && npx nx lint trades` — fix any lint errors (unused imports, missing semicolons, untyped `any` from new service methods)
- [ ] T036 [P] Run `cd apps/Invenet.Api && dotnet build` — confirm zero errors and zero warnings in the Trades module
- [ ] T036b [P] Run `npx nx test trades` — verify all existing and new unit tests in the trades library pass; fix any regressions in store/service tests caused by the new store methods or `trade.model.ts` additions
- [ ] T036c [P] Run `dotnet test` from repo root — verify zero failures in `Invenet.Api.Tests`; run after `dotnet build` completes
- [ ] T037 Run `npx nx build invenet --configuration=production` — confirm production bundle succeeds with no errors or budget warnings
- [ ] T038 Manual smoke test per `quickstart.md` verification checklist — start backend (`dotnet watch run`), start frontend (`npx nx serve invenet`), run all 26 verification items across US1/US2/US3 plus cross-cutting checks

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — all 6 tasks [P], start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — T007 and T008 can run in parallel; BLOCKS Phases 3, 4, 5
- **Phase 3 (US1)**: Depends on Phase 2 — backend tasks (T009–T011) run in parallel with frontend tasks (T012–T019); T020–T023 depend on earlier US1 tasks
- **Phase 4 (US2)**: Depends on Phase 3 completion — T024/T025 parallel, T026 sequential; T027/T028 parallel frontend
- **Phase 5 (US3)**: Depends on Phase 3 completion — can run in parallel with Phase 4
- **Phase 6 (Polish)**: Depends on Phases 3, 4, 5 all complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (Phase 2). No dependency on US2 or US3. Delivers the entire component tree.
- **US2 (P2)**: Depends on US1 (Phase 3) — extends the shell and store built in US1.
- **US3 (P3)**: Depends on US1 (Phase 3) — extends the shell and store built in US1. Can run in parallel with US2.

### Within Each User Story

- Backend DTOs before controller action (T009–T010 before T011; T024–T025 before T026)
- Model types before service method before store method (T007 before T012 before T013)
- UI component files before shell wiring (T014–T019 before T020–T022)
- Shell complete before modifying trades.ts (T020–T022 before T023)

### Parallel Opportunities

- All Phase 1 tasks (T001–T006): all parallel
- Phase 2: T007 ∥ T008
- Phase 3 backend: T009 ∥ T010, then T011
- Phase 3 frontend data-access: T012 ∥ T013 (after T007)
- Phase 3 frontend UI: T014 ∥ T015 ∥ T016 ∥ T017 ∥ T018 ∥ T019 (all different files)
- Phase 4 backend: T024 ∥ T025, then T026
- Phase 4 frontend: T027 ∥ T028
- Phases 4 and 5 can run in parallel (different files)
- Phase 6: T034 ∥ T035 ∥ T036, then T037, then T038

---

## Parallel Execution Example: User Story 1

Two agents starting Phase 3 simultaneously after Phase 2 completes:

**Agent A — Backend**:

```
T009 → T010 → T011
```

**Agent B — Frontend**:

```
T012 → T013
T014 ∥ T015 ∥ T016 ∥ T017 ∥ T018 ∥ T019 → T020 → T021 → T022 → T023
```

---

## Implementation Strategy

**MVP scope (US1 only — Phases 1, 2, 3, 6)**: 23 tasks. Delivers a fully working create flow end-to-end.

**Full scope (all stories — Phases 1–6)**: 38 tasks. Adds edit and delete on top of the create foundation.

Suggested delivery order:

1. Complete Phase 1 + Phase 2 (unblocks everything)
2. Complete Phase 3 / US1 (MVP — most impactful)
3. Complete Phase 4 / US2 + Phase 5 / US3 in parallel
4. Complete Phase 6 (Polish)
