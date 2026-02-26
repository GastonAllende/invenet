## 1. Backend — Data Model & Migration

- [x] 1.1 Create DB migration: add `StrategyVersionId` (uuid, nullable initially), `Direction` (enum Long/Short), `OpenedAt` (timestamptz), `ClosedAt` (nullable), `RMultiple` (decimal, nullable), `Pnl` (decimal, nullable), `Tags` (text[], nullable), `Notes` (text, nullable), `IsArchived` (bool, default false), `UpdatedAt` (timestamptz) to the `Trades` table
- [x] 1.2 In migration: populate `StrategyVersionId` for all rows where `StrategyId` is set (use the strategy's current version at migration time)
- [x] 1.3 Make `StrategyVersionId` non-nullable (or document the nullable policy for pre-migration rows) *(documented policy: kept nullable for legacy pre-migration rows without any strategy association)*
- [x] 1.4 Remove `StrategyId` column from `Trades` table (or mark as deprecated)
- [x] 1.5 Replace `Status` enum values: remove `Win`/`Loss`, keep `Open`/`Closed`
- [x] 1.6 Write migration rollback script

## 2. Backend — API Endpoints

- [x] 2.1 Update `POST /trades` handler: accept optional `strategyId` OR explicit `strategyVersionId`; resolve and store `strategyVersionId` (reject if strategy has no current version)
- [x] 2.2 Update `GET /trades` handler: support query params `accountId`, `strategyId`, `status`, `dateFrom`, `dateTo`, `includeArchived` (default false)
- [x] 2.3 Update `GET /trades/:id` handler to return new fields (`strategyVersionId`, `direction`, `openedAt`, `closedAt`, `rMultiple`, `pnl`, `tags`, `notes`, `isArchived`)
- [x] 2.4 Update `PUT /trades/:id` handler: allow editing `direction`, `symbol`, `entryPrice`, `exitPrice`, `openedAt`, `closedAt`, `quantity`, `rMultiple`, `pnl`, `tags`, `notes`, `status`; allow changing `strategyVersionId` via explicit `strategyId` (resolves to new current version)
- [x] 2.5 Add `POST /trades/:id/archive` endpoint (sets `IsArchived = true`)
- [x] 2.6 Add `POST /trades/:id/unarchive` endpoint (sets `IsArchived = false`)
- [x] 2.7 Remove `DELETE /trades/:id` from public routing (or keep but not expose in UI)
- [x] 2.8 Update request/response DTOs and OpenAPI docs to reflect new model

## 3. Frontend — Data Layer (`libs/trades/src/data-access/`)

- [x] 3.1 Refactor `trade.model.ts`: replace `type: BUY|SELL` with `direction: Long|Short`; replace `strategyId` with `strategyVersionId`; add `openedAt`, `closedAt`, `rMultiple`, `pnl`, `tags`, `notes`, `isArchived`, `updatedAt`; change `status` to `Open|Closed`; add `strategyName` and `strategyVersionNumber` to list response for display
- [x] 3.2 Update `CreateTradeRequest`: require `strategyVersionId` (or `strategyId` for server-resolution), `accountId`, `symbol`, `direction`, `entryPrice`, `openedAt`; add all optional fields
- [x] 3.3 Update `UpdateTradeRequest`: allow editing all mutable fields per design
- [x] 3.4 Update `TradesApiService.list()`: accept a filters object `{ accountId, strategyId?, status?, dateFrom?, dateTo?, includeArchived? }` and build `HttpParams` accordingly
- [x] 3.5 Update `TradesApiService.create()` and `update()` to match new request/response types
- [x] 3.6 Add `TradesApiService.archive(id)` and `unarchive(id)` methods
- [x] 3.7 Remove `TradesApiService.delete()` (replace with archive in all callers)
- [x] 3.8 Add `TradesApiService.get(id)` for loading a single trade detail
- [x] 3.9 Update `TradesStore`: replace `deleteTrade` with `archiveTrade` / `unarchiveTrade` rxMethods; add `loadTradeDetail` rxMethod; add `selectedTradeDetail` state; update `loadTrades` to accept filters object; add `isQuickModalOpen` signal; add `openQuickModal()` / `closeQuickModal()` methods

## 4. Frontend — Quick Log Trade Modal (`libs/trades/src/lib/ui/quick-trade-modal/`)

- [x] 4.1 Create `QuickTradeModalComponent` (`quick-trade-modal.component.ts` + `.html` + `.css`) using `p-dialog` with header "Quick Log Trade"
- [x] 4.2 Add form fields: Account (`p-select`, required), Symbol (text input, required), Direction (`p-select` Long/Short, required), Strategy (`p-select`, required), Entry Price (number input, required), Quantity (number input, optional)
- [x] 4.3 On strategy selection: call `StrategiesApiService.get(id)` to resolve `currentVersion`; display version as read-only "v{N}" label; disable Save if no current version
- [x] 4.4 Add reactive form validation with inline PrimeNG messages
- [x] 4.5 Implement `submitQuickTrade()`: POST /trades with resolved `strategyVersionId`, show success toast "Trade logged", close modal
- [x] 4.6 On API error: show error toast, keep modal open
- [x] 4.7 Default Account dropdown to `ActiveAccountStore.activeAccountId()` on open
- [x] 4.8 Reset all fields on close
- [x] 4.9 Add `QuickTradeService` with `open(accountId?: string)` and `close()` methods that control `TradesStore.isQuickModalOpen` signal
- [x] 4.10 Render `QuickTradeModalComponent` once in `app.layout` (or `trade-shell` at app level) — outside router outlet
- [x] 4.11 Add "Quick Log Trade" button to topbar that calls `QuickTradeService.open()`
- [x] 4.12 Export `QuickTradeModalComponent` and `QuickTradeService` from `libs/trades/src/index.ts`

## 5. Frontend — Journal List (`libs/trades/src/lib/ui/trade-list/`)

- [x] 5.1 Refactor `TradeListComponent` inputs: replace `Trade[]` model with new model; add `includeArchived` input + `includeArchivedChange` output
- [x] 5.2 Update table columns: Date (openedAt), Symbol, Direction badge, Account name, Strategy + version, R-Multiple, P&L, Status badge
- [x] 5.3 Add filter bar above table: Account dropdown, Strategy dropdown, Date range picker (`p-datepicker` range mode), Status dropdown (All/Open/Closed)
- [x] 5.4 Add "Show archived" checkbox (same pattern as accounts/strategies pages)
- [x] 5.5 Replace "Create" button with two buttons: primary "Log Trade (full)" (→ `/journal/new`) and secondary "Quick Log Trade" (opens modal)
- [x] 5.6 Replace `edit` and `delete` outputs with `view` (→ `/journal/:id`) and `archive`/`unarchive` outputs
- [x] 5.7 Emit filter changes upward to shell/store; shell calls `store.loadTrades(filters)` on each change
- [x] 5.8 Update `getStatusSeverity()` for new `Open`/`Closed` enum values; remove `Win`/`Loss`/`BUY`/`SELL` helpers

## 6. Frontend — Full Trade Entry/Edit Page (`libs/trades/src/lib/ui/trade-form/`)

- [x] 6.1 Refactor `TradeFormComponent` to support `mode: 'create' | 'edit'` input
- [x] 6.2 Add all form fields matching the full spec (see task 3.1 field list), with conditional required validation for `exitPrice` and `closedAt` when `status = Closed`
- [x] 6.3 When editing: show existing `strategyVersionId` as read-only "Version: v{N}"; on strategy change show confirmation dialog before resolving new version
- [x] 6.4 Wire `save` output with full `CreateTradeRequest` / `UpdateTradeRequest` payload including `strategyVersionId`
- [x] 6.5 Add `formCancel` output; on cancel navigate back to detail or list

## 7. Frontend — Trade Detail Page (`libs/trades/src/lib/ui/trade-detail/`)

- [x] 7.1 Create `TradeDetailComponent` (`trade-detail.component.ts` + `.html` + `.css`) — read-only view
- [x] 7.2 Display all fields: Symbol, Direction, Account badge, Strategy name + "v{N}", openedAt, closedAt, entryPrice, exitPrice, pnl, rMultiple, tags (as chips), notes, Status badge, isArchived banner
- [x] 7.3 Add "Edit" button → router navigate to `/journal/:id/edit`
- [x] 7.4 Add "Archive" button (with `p-confirmDialog`) calling `store.archiveTrade(id)` — show only when not archived
- [x] 7.5 Add "Unarchive" button calling `store.unarchiveTrade(id)` — show only when archived
- [x] 7.6 Add "Back to Journal" button → `/journal`

## 8. Frontend — Trade Shell & Routing

- [x] 8.1 Refactor `TradeShellComponent` to support modes: `list`, `new`, `detail`, `edit` (same pattern as `StrategyShellComponent`)
- [x] 8.2 Read `journalMode` from route `data` and `tradeId` from route params
- [x] 8.3 In `list` mode: pass filters from shell signals to store; handle `includeArchivedChange` event
- [x] 8.4 In `new` mode: render `TradeFormComponent` with `mode='create'`; on save dispatch `store.createTrade()` and navigate to `/journal/:id`
- [x] 8.5 In `detail` mode: load trade detail from store (`store.loadTradeDetail(id)`); render `TradeDetailComponent`
- [x] 8.6 In `edit` mode: pre-populate `TradeFormComponent` with existing trade data; on save dispatch `store.updateTrade()` and navigate to `/journal/:id`
- [x] 8.7 Update `app.routes.ts`: add `/journal` (list), `/journal/new`, `/journal/:id`, `/journal/:id/edit` routes with `journalMode` data; add redirect from `/trades` → `/journal`
- [x] 8.8 Update nav menu link from `/trades` to `/journal`
- [x] 8.9 Export `TradeDetailComponent` from `libs/trades/src/index.ts`

## 9. Cleanup & Polish

- [x] 9.1 Remove or update existing `deleteTrade` usages throughout the codebase (replace with archive)
- [x] 9.2 Add success/error toasts for archive and unarchive operations in the shell
- [x] 9.3 Update `AGENTS.md` to document the new Trades library structure and `/journal` route
- [ ] 9.4 Run `npx nx run trades:lint` and fix any lint errors
- [ ] 9.5 Run `npx nx run trades:test` and update/add tests for the new store methods and model changes
