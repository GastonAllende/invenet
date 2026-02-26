# Journal UX Map

Single source of truth for Journal (`/journal`) UI behavior, state ownership, and API contracts.

## Scope

- Frontend routes: `apps/invenet/src/app/app.routes.ts`
- Journal shell: `libs/trades/src/lib/feature/trade-shell/`
- Data layer: `libs/trades/src/data-access/src/lib/`
- Backend trades API: `apps/api/Invenet.Api/Modules/Trades/`

## Route Map

| Route | Mode (`journalMode`) | Primary UI | Expected Action |
|---|---|---|---|
| `/journal` | `list` | `TradeListComponent` | Browse/filter, view detail, archive/unarchive, open quick/full entry |
| `/journal/new` | `new` | `TradeFormComponent` | Create trade |
| `/journal/:id` | `detail` | `TradeDetailComponent` | Read-only view, edit/archive/unarchive |
| `/journal/:id/edit` | `edit` | `TradeFormComponent` | Edit trade |

Legacy redirects:
- `/trades` -> `/journal`
- `/trades/new` -> `/journal/new`
- `/trades/:id` -> `/journal/:id`
- `/trades/:id/edit` -> `/journal/:id/edit`

## Flow Summary

### List Flow (`/journal`)

1. Resolve active account from `ActiveAccountStore`.
2. Shell calls `TradesStore.loadTrades({ accountId, includeArchived, ...filters })`.
3. Table renders `trades` entities.
4. User actions:
   - `Log Trade (full)` -> `/journal/new`
   - `Quick Log Trade` -> open global quick modal
   - `View` -> `/journal/:id`
   - `Archive`/`Unarchive` -> `TradesStore.archiveTrade/unarchiveTrade`

### New Flow (`/journal/new`)

1. Render form in `mode='create'`.
2. Submit -> `TradesStore.createTrade(payload)`.
3. On success, shell effect navigates to `/journal/:id` via `lastSavedId`.

### Detail Flow (`/journal/:id`)

1. Shell loads detail with `TradesStore.loadTradeDetail(id)`.
2. Render read-only detail.
3. User actions:
   - `Edit` -> `/journal/:id/edit`
   - `Archive`/`Unarchive` -> store methods
   - `Back to Journal` -> `/journal`

### Edit Flow (`/journal/:id/edit`)

1. Shell loads detail with `loadTradeDetail(id)`.
2. Render form in `mode='edit'`, pre-populated from detail.
3. Submit -> `TradesStore.updateTrade({ id, request })`.
4. On success navigate to `/journal/:id`.

## State Ownership

| State | Owner | Written By | Read By |
|---|---|---|---|
| `activeAccountId` | `ActiveAccountStore` | topbar, account flows | journal shell, quick modal |
| `entities` (trade list) | `TradesStore` | `loadTrades/create/update/archive/unarchive` | list view |
| `selectedTradeDetail` | `TradesStore` | `loadTradeDetail` | detail/edit form |
| `isQuickModalOpen` | `TradesStore` | `QuickTradeService` | quick modal |
| `includeArchived` | `TradeShellComponent` local signal | list toggle | `loadTrades` args |
| list filters (`strategy/status/date`) | `TradeShellComponent` local signal | list filter bar | `loadTrades` args |
| route mode/id | Angular Router | navigation | `TradeShellComponent` |

Rule: do not duplicate these state keys in multiple stores.

## API Contract Map

### List

`GET /api/trades?accountId&strategyId?&status?&dateFrom?&dateTo?&includeArchived?`

- Required: `accountId`
- Response: `ListTradesResponse { trades: Trade[], total }`

### Detail

`GET /api/trades/:id`

- Response includes: `strategyVersionId`, `direction`, `openedAt`, `closedAt`, `rMultiple`, `pnl`, `tags`, `notes`, `isArchived`.

### Create

`POST /api/trades`

- Required fields: `accountId`, `direction`, `openedAt`, `symbol`, `entryPrice`
- Strategy requirement: provide `strategyVersionId` or `strategyId` (server resolves to current version)

### Update

`PUT /api/trades/:id`

- Editable fields include: `direction`, `symbol`, `entryPrice`, `exitPrice`, `openedAt`, `closedAt`, `quantity`, `rMultiple`, `pnl`, `tags`, `notes`, `status`, strategy version via `strategyId`/`strategyVersionId`.

### Archive

- `POST /api/trades/:id/archive`
- `POST /api/trades/:id/unarchive`

## UX Invariants

1. Journal list defaults to active account.
2. Archived trades hidden unless `includeArchived=true`.
3. Quick modal can open from any page.
4. Save in create/edit always lands on detail page.
5. Detail page must always have back/edit/archive actions.

## Pre-PR Checklist (Journal Changes)

1. Route behavior updated in `app.routes.ts` and legacy redirects still valid.
2. Shell mode logic updated (`list/new/detail/edit`).
3. `TradesStore` + `TradesApiService` signatures aligned.
4. Form/list/detail component contracts aligned with `trade.model.ts`.
5. Quick modal still works with active account and strategy version resolution.
6. Archive/unarchive toasts and list refresh behavior verified.
7. Type checks pass:
   - `npx tsc -p libs/trades/tsconfig.lib.json --noEmit`
   - `npx tsc -p apps/invenet/tsconfig.app.json --noEmit`
8. Run Nx lint/tests when plugin workers are healthy:
   - `npx nx run trades:lint`
   - `npx nx run trades:test`

## Known Risk

Current environment intermittently fails Nx plugin workers, which blocks `nx` lint/test runs. Keep this document as canonical even when Nx commands are temporarily unavailable.

## Decision Log

Use this format for every UX-impacting decision:

| Date (YYYY-MM-DD) | Area | Decision | Rationale | Changed Files |
|---|---|---|---|---|
| 2026-02-26 | Routing | Moved primary trade routes from `/trades` to `/journal` with redirects from legacy paths. | Separate journaling flow from generic trades naming and support list/new/detail/edit route modes. | `apps/invenet/src/app/app.routes.ts`, `apps/invenet/src/app/layout/component/app.menu.ts` |
| 2026-02-26 | Entry UX | Added global Quick Log modal, opened from topbar and rendered once at app layout level. | Allow fast logging from any page without navigation. | `apps/invenet/src/app/layout/component/app.layout.ts`, `apps/invenet/src/app/layout/component/app.topbar.ts`, `libs/trades/src/lib/ui/quick-trade-modal/*`, `libs/trades/src/lib/services/quick-trade.service.ts` |
| 2026-02-26 | Data Model | Replaced `type/BUY|SELL` and `Win|Loss|Open` with `direction Long|Short` and `status Open|Closed`; replaced `strategyId` persistence with `strategyVersionId`. | Align records with versioned strategies and clearer trade lifecycle semantics. | `apps/api/Invenet.Api/Modules/Trades/**/*`, `libs/trades/src/data-access/src/lib/models/trade.model.ts` |
| 2026-02-26 | Deletion Policy | Replaced delete-first UX with archive/unarchive actions in list/detail flows. | Preserve journal history and match soft-delete behavior used in other modules. | `apps/api/Invenet.Api/Modules/Trades/API/TradesController.cs`, `libs/trades/src/data-access/src/lib/services/trades-api.service.ts`, `libs/trades/src/lib/ui/trade-list/*`, `libs/trades/src/lib/ui/trade-detail/*` |
