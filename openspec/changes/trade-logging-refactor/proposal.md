## Why

The current trade model is too limited: it stores only `strategyId` (optional), lacks a `strategyVersionId` (meaning trade records don't capture which exact ruleset was in effect), and has no quick-entry path — it forces users through a full form every time. This creates friction for fast trade logging during live sessions and makes post-trade analysis imprecise because the strategy version used cannot be reconstructed.

## What Changes

- **BREAKING**: Trade schema refactored — `strategyId` replaced by `strategyVersionId` (required). `direction` (Long/Short) replaces `type` (BUY/SELL). Fields added: `openedAt`, `closedAt`, `rMultiple`, `tags`, `notes`, `isArchived`.
- **BREAKING**: `POST /trades` now requires `strategyVersionId` (server may auto-resolve from `strategyId` if provided, but `strategyVersionId` is always stored).
- **BREAKING**: `PUT /trades/:id` updated — editable fields redefined; strategy version is immutable after creation.
- **NEW**: `POST /trades/:id/archive` and `POST /trades/:id/unarchive` endpoints added (replaces `DELETE /trades/:id`).
- **NEW**: Quick Log Trade modal component — lightweight overlay accessible from any page, defaults to active account.
- **NEW**: Full Trade Entry/Edit page — all trade fields including exit data, tags, notes, P&L, R-multiple.
- **NEW**: Trade Detail page — read-only view with full context (account, strategy name + version, entry/exit, R, PnL).
- Updated Journal List with account/strategy/date/status filters and both "Log Trade" and "Quick Log Trade" entry points.
- `TradesApiService` and `TradesStore` updated to match new model.
- Data migration needed: existing trades with `strategyId` should have `strategyVersionId` populated using the strategy's current version at migration time.

## Capabilities

### New Capabilities

- `quick-trade-modal`: Lightweight PrimeNG dialog for fast trade entry from any page; resolves `strategyVersionId` from selected strategy; defaults account to active account.
- `trade-entry-page`: Full trade entry and edit page (`/journal/new`, `/journal/:id/edit`) with all fields, validation, and P&L/R-multiple calculation.
- `trade-detail-page`: Read-only trade detail page (`/journal/:id`) showing all trade data including account badge, strategy name + version, entry/exit, R, PnL, tags, notes.
- `journal-list`: Enhanced journal list (`/journal`) with account/strategy/date range/status filters and dual entry points (quick + full).

### Modified Capabilities

_(No existing specs to delta — `openspec/specs/` is empty.)_

## Impact

- **Backend**: Trade DB table schema change (migration required). New endpoints: archive/unarchive. Updated create/update contracts.
- **Frontend — `libs/trades`**: `trade.model.ts`, `trades-api.service.ts`, `trades.store.ts` all require significant updates. New components: `quick-trade-modal`, refactored shell/form/list/detail components.
- **Frontend — `apps/invenet`**: Topbar or global layout needs a "Quick Log Trade" trigger. Routes updated for `/journal/:id` and `/journal/:id/edit`.
- **Dependencies**: Relies on `AccountsStore` (active account), `ActiveAccountStore`, and `StrategiesStore` (strategy list + current version resolution).
